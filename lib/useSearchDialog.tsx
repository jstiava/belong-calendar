'use client';
import {
  ExpandMore,
  Public,
  ReceiptLong,
  Send,
  VerifiedUser,
  ExpandMore as ExpandMoreIcon,
  AccessTime,
  AddLink,
  AccountCircleOutlined,
  Search,
} from '@mui/icons-material';
import {
  Typography,
  Box,
  IconButton,
  ButtonBase,
  Button,
  TextField,
  useTheme,
  Accordion as MuiAccordion,
  AccordionSummary,
  AccordionDetails,
  styled,
  Chip,
  InputAdornment,
  FormControl,
  FormHelperText,
  Avatar,
  InputLabel,
  Modal,
  Paper,
  AccordionProps,
  InputBase,
  Input,
  Tabs,
  Tab,
} from '@mui/material';
import { DateCalendar, DatePicker, TimePicker, TimePickerProps } from '@mui/x-date-pickers';
import axios_external from 'axios';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useState, useEffect, useRef, useCallback, ReactElement, useMemo } from 'react';
import { isMemberInstance, Member } from "@/schema";
export interface UseSearchDialog {
  SearchForm: ReactElement;
  SearchButton: ReactElement;
  toggleSearch: (open: boolean) => void;
}

const MyButton = styled(Button)(({ theme }) => {
  return {
    textTransform: 'capitalize',
  };
});

export interface CategoryDeclaration {
  label: string,
  value: string,
  search: (query: string) => Promise<any[]>,
}

export interface SearchDialogConfig {
  purpose: string,
  itemName: string,
  defaultCategory: string,
  categories: CategoryDeclaration[]
}

export default function useSearchDialog(
  config: SearchDialogConfig,
  handleSelection: (item: any) => void,
  handleAction: ((item: any) => void) | null,
  Card: React.ComponentType<{ item: any; onClick: any, onAction: any }>,
): UseSearchDialog {

  const router = useRouter();
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const [results, setResults] = useState<any | null>(null);
  const [shown, setShown] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>(config.defaultCategory);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    if (newValue === 'all') {
      setShown(results);
      return;
    }
    return;
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const fetchSearchResults = async (searchQuery: string) => {
    // console.log(searchQuery.length);

    if (searchQuery.length > 0) {
      if (searchQuery.length % 2 != 0) {
        console.log("Stopped")
        return;
      }
    }

    try {
      let active = config.categories.find((item) => item.value === activeTab);

      if (!active) {
        active = config.categories.find((item) => item.value === config.defaultCategory);
      };

      if (!active) {
        throw Error("Again")
      }

      console.log(active)
      const rawResults = await active.search(searchQuery);
      setResults(rawResults);
      setShown(rawResults)
    } catch (err) {
      console.log(err)
    }
    return;
  };

  useEffect(() => {
    if (isOpen && !results) {
      fetchSearchResults("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const toggleDrawer = (open: boolean): void => {
    setIsOpen(open);
  };

  const handleSelectionRequest = (item: any) => {
    handleSelection(item);
    setIsOpen(false);
  };

  // const changeCategory = (token: string) => {
  //   setCategory(token);
  //   if (token === 'all') {
  //     setShown(results);
  //     return;
  //   }
  //   const newList = handleCategoryChange(token, results);
  //   setShown(newList);
  //   return;
  // }

  const SearchButton = (
    <TextField
      key="location_name"
      name="location_name"
      sx={{ width: "100%" }}
      label={`${config.purpose}`}
      variant="filled"
      placeholder={`${config.itemName} Name`}
      onClick={() => {
        toggleDrawer(true);
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Search />
          </InputAdornment>
        ),
      }}
    />
  );

  const ExpandedSearchForm = (
    <Box role="presentation" sx={{ minHeight: "calc(100% - 4.5rem)" }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        <div
          style={{
            padding: '0 1rem',
            width: '100%',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            backgroundColor: theme.palette.background.paper
          }}
        >
          <div style={{ padding: "0.5rem 1rem" }}>
            <h2>{config.itemName} Search</h2>
          </div>
          <TextField
            fullWidth
            autoFocus
            key="search_name_exp"
            name="search_name_exp"
            label={`Search`}
            variant="filled"
            onChange={e => fetchSearchResults(e.target.value)}
            InputProps={{
              endAdornment: (
                <Search />
              ),
            }}
          />
          <Tabs value={activeTab} onChange={handleTabChange} className="flex compact" style={{ position: 'sticky' }}>
            {config.categories && config.categories.map((item) => (
              <Tab key={item.value} label={item.label} value={item.value} />
            ))}
          </Tabs>
        </div>
        <div style={{ padding: '1rem 2rem', flexDirection: 'column' }}>
          {/* <Typography variant="caption">Search Results from Google Maps</Typography> */}
          {shown && shown.length > 0 ? (
            shown.map((res, index) => (
              <Card key={index} item={res} onClick={() => handleSelectionRequest(res)} onAction={!isMemberInstance(res) ? handleAction : null} />
            ))
          ) : (
            <></>
          )}
        </div>
      </div>
    </Box >
  );

  const SearchForm = (
    <Modal
      open={isOpen}
      onClose={() => {
        toggleDrawer(false);
      }}
      // variant="temporary"
      keepMounted
    // hideBackdrop
    >
      <Paper
        tabIndex={-1}
        sx={{
          position: 'relative',
          top: '15%',
          left: '50%',
          transform: 'translate(-50%, 0%)',
          width: '55rem',
          height: '70vh',
          maxHeight: '90vh',
          borderRadius: '0.5rem',
          overflowX: 'hidden',
          overflowY: 'scroll',
          maxWidth: "100vw",
        }}
      >
        {isOpen && ExpandedSearchForm}
        <div
          className="flex between"
          style={{
            position: 'sticky',
            bottom: 0,
            padding: '1rem 2rem',
            zIndex: '1000',
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper
          }}
        >
          <MyButton
            color="error"
            variant="text"
            onClick={e => {
              toggleDrawer(false);
            }}
          >
            Cancel
          </MyButton>
          <div className="flex" style={{ width: 'fit-content' }}>
            {/* <MyButton variant="outlined">Attach</MyButton> */}
            <MyButton variant="contained">Select</MyButton>
          </div>
        </div>
      </Paper>
    </Modal>
  );

  return { SearchForm, SearchButton, toggleSearch: toggleDrawer };
}
