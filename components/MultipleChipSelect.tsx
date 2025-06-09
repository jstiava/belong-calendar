"use client"
import { useState, useRef, useEffect, JSX } from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import SmallTextField from './SmallTextField';
import { Avatar, Fade, Popover, TextField, Typography, useMediaQuery } from '@mui/material';
import Fuse from 'fuse.js';
import ItemStub from './ItemStub';
import { Member, MemberFactory } from '@jstiava/chronos';
import { MEDIA_BASE_URI } from '@/lib/useComplexFileDrop';
import ResolveItemIcon from './ResolveItemIcon';
import { InfoOutlined, WarningOutlined } from '@mui/icons-material';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = [
  'Oliver Hansen',
  'Van Henry',
  'April Tucker',
  'Ralph Hubbard',
  'Omar Alexander',
  'Carlos Abbott',
  'Miriam Wagner',
  'Bradley Wilkerson',
  'Virginia Andrews',
  'Kelly Snyder',
];


export default function FilteredSelect({
  getId = (item) => { return item.id() },
  label,
  onChange,
  selected,
  setSelected,
  initialRecommendations,
  onClick
}: {
  getId?: (item: any) => string,
  label: string,
  onChange: any,
  selected: any[],
  setSelected: any,
  initialRecommendations: JSX.Element,
  onClick: any
}) {

  const theme = useTheme();
  const [filtered, setFiltered] = useState<any[] | null>(null);
  const inputRef = useRef<any>(null);
  const isMed = useMediaQuery(theme.breakpoints.down('md'));
  const searchQuery = useRef<string | null>(null);

  const [anchorEl, setAnchorEl] = useState<any | null>(null);
  const isPopoverOpen = Boolean(anchorEl);

  const handleAdd = (target: any) => {
    setSelected((prev: any) => {
      const copy = prev;
      const filtered = copy.filter((x: any) => getId(x) != getId(target));
      filtered.push(target);
      return filtered;
    })
  }

  const handleRemove = (target: any) => {
    setSelected((prev: any) => {
      const copy = prev;
      const filtered = copy.filter((x: any) => getId(x) != getId(target));
      return filtered;
    })
  }

  return (
    <div
      className='column snug'
      style={{
        position: 'relative'
      }}
    >
      <FormControl sx={{ width: "100%" }}>
        <InputLabel id="demo-multiple-chip-label">{label}</InputLabel>
        <Select
          labelId="demo-multiple-chip-label"
          id="demo-multiple-chip"
          multiple
          aria-label={label}
          label={label}
          value={selected}
          open={false}
          onOpen={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const target = e.currentTarget || e.target;
            setAnchorEl(target)
          }}
          onKeyDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((item) => (
                <Chip
                  key={getId(item)}
                  label={item.name}
                  sx={{
                    padding: 0,
                    '& .MuiChip-icon': {
                      marginLeft: 0,
                    },

                  }}
                  icon={item.status && item.status === 'action_required' ? (
                    <Avatar sx={{
                      width: "1.75rem",
                      height: "1.75rem",
                      backgroundColor: theme.palette.warning.main
                    }}
                      src={('icon_img' in item && item.icon_img) ? `${MEDIA_BASE_URI}/${item.icon_img.path}` : undefined}>
                      <WarningOutlined
                        sx={{
                          fontSize: "0.75rem",
                          color: theme.palette.warning.contrastText
                        }}
                      />
                    </Avatar>
                  ) : (<Avatar sx={{
                    width: "1.75rem",
                    height: "1.75rem",
                    backgroundColor: item.theme_color
                  }}
                    src={('icon_img' in item && item.icon_img) ? `${MEDIA_BASE_URI}/${item.icon_img.path}` : undefined}>
                    <ResolveItemIcon
                      item={item}
                      sx={{
                        fontSize: "0.75rem",
                        color: item.theme_color ? theme.palette.getContrastText(item.theme_color) : theme.palette.text.primary
                      }}
                    />
                  </Avatar>)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    onClick(item);
                  }}
                  onDelete={e => {
                    handleRemove(item);
                  }}
                />
              ))}
            </Box>
          )}
          sx={{
            '& .MuiSelect-select': {
              padding: '0.75rem 0.75rem',
              minHeight: "2.125rem",
              height: 'fit-content'
            }
          }}
        />
      </FormControl>
      {selected.some(x => x.status === 'action_required') && (
        <div className="flex compact2 center" style={{
          color: theme.palette.warning.main,
          padding: "0.25rem"
        }}>
          <InfoOutlined sx={{
            fontSize: "0.875rem",
          }} />
          <Typography variant="caption">Action Required</Typography>
        </div>
      )}
      <Popover
        // disableAutoFocus
        // disableEnforceFocus
        anchorEl={anchorEl}
        open={isPopoverOpen}
        onClick={(e) => {
          setAnchorEl(null);
        }}
        onClose={(e: any) => {
          e.stopPropagation();
          setAnchorEl(null)
        }}
        onAnimationEnd={() => {
          if (inputRef.current) {
            inputRef.current.focus()
          }
        }}
        slots={{
          transition: Fade,
        }}
        slotProps={{
          paper: {
            sx: {
              width: anchorEl ? anchorEl.offsetWidth : undefined
            }
          },
          transition: {
            timeout: 300,
          },
        }}

      >
        <div
          className='column snug'
          style={{
            position: 'relative',
            width: '100%',
            top: 0,
            left: 0,
            backgroundColor: theme.palette.background.paper,
            borderRadius: "0.25rem",
            // boxShadow: theme.shadows[1],
            zIndex: 2,
            overflowY: 'scroll',
            maxHeight: isMed ? "70vh" : "15rem",
          }}
        >
          <SmallTextField
            inputRef={inputRef}
            placeholder='Search'
            onChange={e => {
              const results = onChange(e);
              setFiltered(results);
            }}
            sx={{
              position: 'sticky',
              top: 0,
              left: 0,
              zIndex: 3,
              backgroundColor: theme.palette.background.paper
            }} />
          <div
            className='column snug'
            style={{
              width: "100%",
              padding: "0.5rem"
            }}>
            {filtered && filtered.length > 0 ? filtered.map(item => (
              <ItemStub
                key={getId(item)}
                item={item}
                onClick={() => {
                  setAnchorEl(null);
                  handleAdd(item);
                  return;
                }}
                sx={{
                  padding: "0.5rem",
                  borderRadius: "0.25rem"
                }}
              />
            )) : (
              <>{initialRecommendations}</>
            )}
          </div>
        </div>
      </Popover>

    </div>
  );
}