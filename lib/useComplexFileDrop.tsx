"use client"
// import axios from '@/utils/axios';
import {
  Button,
  IconButton,
  Typography,
  styled,
  useTheme,
  lighten,
  Modal,
  Paper,
  ButtonBase,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import { CancelTokenSource } from 'axios';
import axiosExternal from 'axios';
import React, { useState, useEffect, SetStateAction, Dispatch } from 'react';
import { Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { v4 as uuidv4 } from 'uuid';
import axios, { API } from './utils/axios';
import { ImageDisplayType, ImageStub } from '@/schema';



const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export const MEDIA_BASE_URI = "https://mozi-belong-media-public-demo.s3.us-east-2.amazonaws.com";
interface FileUploadProps {
  instructions: string;
}

export type UploadType = ImageStub & {
  uuid: string;
  file: File | null;
  progress: number;
  tokenSource: CancelTokenSource | null;
  previewUrl: string;
  uploading: boolean;
  isLocal: boolean;
  extension: string;
}

export default function useComplexFileDrop(presets: ImageStub[] | null, uploads: UploadType[], setUploads: Dispatch<SetStateAction<UploadType[]>>) {
  const theme = useTheme();
  const [isDragOver, setIsDragOver] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();


  const [uploadCount, setUploadCount] = useState(0);

  useEffect(() => {
    setUploadCount(uploads.length);
  }, [uploads]);

  useEffect(() => {
    if (!presets || presets.length === 0) return;

    setIsUploadPresent(true);

    let theUploads = uploads;

    presets.forEach((file) => {

      if (theUploads.some(x => x.path === file.path)) {
        return;
      }
      theUploads.push({
        ...file,
        uuid: file.path,
        file: null,
        progress: 100,
        tokenSource: null,
        previewUrl: `${MEDIA_BASE_URI}/${file.path}`,
        path: `${file.path}`,
        uploading: false,
        isLocal: false,
        extension: ""
      })
    });


    setUploads(theUploads);
    setUploadCount(theUploads.length)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [isOpen, setIsOpen] = useState(false);
  const [isUploadPresent, setIsUploadPresent] = useState(false);

  const closeDialog = () => {
    setIsOpen(false);
  };


  const handleRemoveFile = async (uuid: string, previewUrl: string, isLocal: boolean) => {
    setUploads((prev) => prev.filter((file) => file.uuid != uuid))
  }

  const openDialog = () => {
    setIsOpen(true);
  };

  const handleDragOver = (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };



  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragOver(false);

    // Check if there are files dropped
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setIsUploadPresent(true);

    let filteredFiles = Array.from(files);
    filteredFiles = Array.from(files).filter(file =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    );

    if (filteredFiles.length != files.length) {
      return enqueueSnackbar('Could not upload image.', {
        variant: 'error',
      });
    }

    const fileUploads = await Promise.all(filteredFiles.map(async (file) => {
      const reader = new FileReader();
      const tokenSource = axiosExternal.CancelToken.source();

      const fileExtension = file.name.split('.').pop();

      const id = uuidv4();
      const uploadEntry: UploadType = {
        uuid: id,
        file,
        progress: 100,
        previewUrl: '',
        tokenSource,
        uploading: true,
        isLocal: true,
        extension: fileExtension || "",
        path: `${id}.${fileExtension}`,
        path_quick: null,
        display_type: ImageDisplayType.Cover,
        blur_hash: null,
        storage: "s3_media"
      };

      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setUploads(currentUploads => {
          const newUploads = [...currentUploads];
          const foundIndex = newUploads.findIndex(u => u.tokenSource === tokenSource);
          if (foundIndex !== -1) {
            newUploads[foundIndex].previewUrl = reader.result as string;
          } else {
            newUploads.push({
              ...uploadEntry,
              previewUrl: reader.result as string,
            });
          }
          return newUploads;
        });
      };

      // uploadEntry.blur_hash = await generateBlurhash(uploadEntry.path);

      return uploadEntry;
    }));

    setUploads(prev => [...prev, ...fileUploads]);
  };




  const handleUpload = async (path: string): Promise<ImageStub[]> => {
    try {

      if (!uploads || uploads.length === 0) {
        return [];
      }

      const files = await Promise.all(uploads.map(async (upload) => {
        if (!upload.isLocal) {
          return {
            path: upload.path,
            path_quick: null,
            display_type: upload.display_type,
            blur_hash: null,
            storage: "s3_media"
          };
        }
        const uniquePath = `${path}/${upload.path}`;
        await postToCloud(upload, uniquePath);
        return {
          path: `${path}/${upload.path}`,
          path_quick: null,
          display_type: upload.display_type,
          blur_hash: null,
          storage: "s3_media"
        };
      }));

      return files;
    } catch (error) {
      console.error('Error handling uploads:', error);
    }
    return [];
  };



  const handleChange = (item: UploadType, event: SelectChangeEvent<any>) => {
    setUploads((prev) => {

      const newList = prev.filter((file) => file.uuid != item.uuid);

      if (!event.target.name || !event.target.value) {
        return prev;
      }

      newList.push({
        ...item,
        [event.target.name]: event.target.value
      });

      return newList;
    })
  }

  const postToCloud = async (upload: UploadType, path: string) => {
    try {
      var webpFile = null;
      var secureUrl = null;


      if (!upload.file || !upload.isLocal) return;

      const reader = new FileReader();
      reader.readAsDataURL(upload.file);

      await axios
        .post(API.GET_SECURE_MEDIA_URL, {
          action: "POST",
          path: `${path}`,
          type: upload.extension
        })
        .then(res => {
          secureUrl = res.data.message;
        })
        .catch(err => {
          console.error('Upload failed', err);
          return;
        });

      return await axiosExternal.put(String(secureUrl), upload.file)
      .catch(err => {
        console.log(err);
        return;
      })
    } catch (error) {
      console.error('Upload failed', error);
    }
  };


  const FileUploadForm = (
    <div className='column'>
      {uploads[0] && (
        <div className="column" style={{ alignItems: "flex-start", height: 'fit-content', padding: '1rem 0.5rem 0 0', width: "100%" }}>
          <>
            {uploads && uploads.map((upload) => (
              <div className='flex between' key={upload.uuid} style={{ width: "100%", position: "relative" }}>
                <div className='flex compact'>
                  <div style={upload.display_type === ImageDisplayType.Cover ? {
                    width: '8rem',
                    height: '5rem',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    borderRadius: '0.5rem',
                    backgroundImage: upload ? `url(${upload.previewUrl})` : '',
                  } : upload.display_type === ImageDisplayType.Portrait ? {
                    width: '5rem',
                    height: '5rem',
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    borderRadius: '100vh',
                    backgroundImage: upload ? `url(${upload.previewUrl})` : '',
                  } : {
                    width: "12rem",
                    height: "5rem",
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    borderRadius: '0.5rem',
                    backgroundColor: theme.palette.primary.main,
                    backgroundImage: upload ? `url(${upload.previewUrl})` : '',
                  }}></div>


                  <div className='column compact' style={{ width: "calc(100% - 9rem)" }}>
                    <Typography component="p" fontSize="0.75rem" style={{ fontWeight: 700, overflowWrap: "break-word", width: "100%" }}>{upload.file ? upload.file.name : upload.uuid}</Typography>
                    <FormControl sx={{ width: "10rem" }}>
                      <InputLabel id="demo-simple-select-label">Display</InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        name="display_type"
                        value={upload.display_type}
                        label="Display"
                        onChange={(e) => handleChange(upload, e)}
                        size="small"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              zIndex: 12,  // Adjust this value based on your layout
                            },
                          },
                        }}
                      >
                        <MenuItem value={"portrait"}>Portrait</MenuItem>
                        <MenuItem value={"cover"}>Cover</MenuItem>
                        <MenuItem value={"wordmark"}>Wordmark</MenuItem>
                        <MenuItem value={"attachment"}>Attachment</MenuItem>
                      </Select>
                    </FormControl>
                    {upload.file && <Typography component="span" fontSize="0.75rem">{(upload.file.size / 1024).toFixed(2)} kb</Typography>}

                  </div>
                </div>
                <div style={{ position: "absolute", right: 0, backgroundColor: lighten(theme.palette.background.paper, 0.05), height: "100%" }}>
                  <IconButton>
                    <Delete onClick={() => handleRemoveFile(upload.uuid, upload.previewUrl, upload.isLocal)} />
                  </IconButton>
                </div>
              </div>
            ))}
          </>
        </div>
      )}
      <div
        className={`visual-drop-area ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={e => {
          handleDrop(e);
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: 'fit-content',
          padding: '2rem',
          justifyContent: 'center',
          alignItems: 'center',
          border: `2px dashed ${theme.palette.divider}`,
          borderRadius: '0.5rem',
        }}
      >
        <>
          <Typography component="p" style={{ fontWeight: 'bold', padding: 0 }}>
            Drop image here.
          </Typography>
          <Typography variant="caption" style={{ padding: 0 }}>Accepted: jpg, png, webp</Typography>
          <Button component="label" variant="outlined" sx={{ width: '100%', marginTop: '1rem' }}>
            Upload file
            <VisuallyHiddenInput
              type="file"
              multiple
              onChange={e => handleFiles(e.target.files)}
              accept={'*'}
            />
          </Button>
        </>
      </div>
    </div>
  );




  const FilePreview = (
    <div className="flex" style={{ position: "relative" }}>
      {uploads[0] && (
        <div className="flex compact" style={{ alignItems: "flex-start", height: 'fit-content', width: "100%", }}>
          {uploads && uploads.map((upload, index) => (
            <ButtonBase
              key={upload.uuid}
              onClick={() => {
                openDialog();
              }}
              sx={
                upload.display_type === ImageDisplayType.Cover ? {
                  width: '8rem',
                  height: '5rem',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  borderRadius: '0.5rem',
                  backgroundImage: upload ? `url(${upload.previewUrl})` : '',
                } : upload.display_type === ImageDisplayType.Portrait ? {
                  width: '5rem',
                  height: '5rem',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  borderRadius: '100vh',
                  backgroundImage: upload ? `url(${upload.previewUrl})` : '',
                } : {
                  width: "10rem",
                  height: "5rem",
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  borderRadius: '0.5rem',
                  backgroundColor: theme.palette.divider,
                  backgroundImage: upload ? `url(${upload.previewUrl})` : '',
                }
              }
            ></ButtonBase>
          ))}
        </div>
      )}
    </div>
  );

  const FileUploadDialog = (
    <>
      <Modal
        open={isOpen}
        onClose={() => {
          closeDialog();
        }}
        keepMounted
        sx={{ zIndex: 10 }}
      >
        <Paper
          tabIndex={-1}
          sx={{
            position: 'relative',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '30rem',
            padding: '1rem',
            height: 'fit-content',
            maxHeight: '90vh',
            borderRadius: '0.5rem',
            overflowX: 'hidden',
            overflowY: 'scroll',
          }}
        >
          {isOpen && FileUploadForm}
          <div
            className="flex compact"
            style={{
              position: 'sticky',
              bottom: 0,
              padding: '0.5rem 0 0 0',
              zIndex: '1000',
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Button
              variant="text"
              onClick={e => {
                closeDialog();
              }}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              variant="text"
              onClick={e => {
                openDialog();
              }}
            >
              Replace
            </Button>
            <Button
              color="error"
              variant="text"
              onClick={e => {
                setUploads([]);
              }}
            >
              Remove
            </Button>
          </div>
        </Paper>
      </Modal>
    </>
  );

  return {
    FileUpload: FileUploadDialog,
    FilePreview,
    handleUpload,
    openDialog,
    isUploadPresent,
    isFileUploadOpen: isOpen,
    uploadCount
  };
}
