import { Accordion, AccordionDetails, AccordionSummary, Collapse, IconButton, lighten, Typography, useTheme } from '@mui/material';

import { ExpandMore as ExpandMoreIcon, RemoveOutlined } from '@mui/icons-material';
import { cloneElement, MouseEvent, ReactNode } from 'react';

interface AccordionCreateModuleProps {
  children: any,
  expanded: boolean,
  onChange: (e: any) => any,
  style?: Object,
  [key: string]: any
}

export default function AccordionCreateModule({ children, expanded, onChange, style, ...props }: AccordionCreateModuleProps) {
  const theme = useTheme();

  return (
    <>
      <Accordion
        expanded={expanded}
        onChange={onChange}
        disableGutters
        elevation={0}
        square
        style={style ? {
          ...style,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: lighten(theme.palette.background.paper, 0.05)
        } : {
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: lighten(theme.palette.background.paper, 0.05)
        }}
      >
        {children}
      </Accordion>
    </>
  );
}

interface AccordionSummaryCreateModuleProps {
  name: string,
  expanded: boolean,
  icon: any,
  preview: any,
  removeModule?: any,
  rightPreview?: JSX.Element,
  expandIcon?: ReactNode,
  [key: string]: any
}

export function AccordionSummaryCreateModule({ name, expanded, icon, preview, removeModule, rightPreview, expandIcon, ...props }: AccordionSummaryCreateModuleProps) {
  return (
    <>
      <AccordionSummary
        {...props}
        expandIcon={expandIcon || <ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
        sx={{
          '& .MuiAccordionSummary-content': {
            width: "calc(100% - 5rem)"
          }
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.25rem 0.25rem 0.25rem 0',
            height: '2rem',
            width: "100%",
          }}
        >
          {icon &&
            cloneElement(icon, {
              sx: {
                ...icon.sx,
                margin: 'auto 0.5rem auto 0.5rem',
                fontSize: 'large'
              },
            })}
          {props.children}
          <Typography sx={{
            fontWeight: 500,
            width: "100%",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            position: "relative"
          }}>{name}</Typography>
          {!expanded && <div style={{ width: 'fit-content', marginLeft: '1rem', maxWidth: "50%" }}>{preview}</div>}
          {removeModule && (
            <>
              {rightPreview ? (
                <>{rightPreview}</>
              ) : (
                <IconButton onClick={removeModule} sx={{ position: "absolute", right: "2.5rem" }}>
                  <RemoveOutlined color="error" />
                </IconButton>
              )}
            </>
          )}
        </div>
      </AccordionSummary>
    </>
  );
}

interface AccordionDetailsCreateModuleProps {
  children: any,
  [key: string]: any,
}

export function AccordionDetailsCreateModule({ children, ...props }: AccordionDetailsCreateModuleProps) {
  return (
    <>
      <AccordionDetails>
        <div className="column" >
          {children}
        </div>
      </AccordionDetails>
    </>
  );
}
