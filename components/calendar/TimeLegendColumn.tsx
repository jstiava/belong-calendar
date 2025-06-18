import { UseCalendar } from '@/lib/useCalendar';
import { Chronos, dayjs } from '@jstiava/chronos';
import { ArrowRight, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useTheme, Typography, Tooltip, IconButton } from '@mui/material';

export default function TimeLegendColumn({
  width,
  Calendar,
  sequence,
  standardHeight,
  isSM
}: {
  width: string,
  Calendar: UseCalendar,
  sequence: number[] | null,
  standardHeight: number;
  isSM: boolean
}) {
  const theme = useTheme();

  return (
    <>
      <div style={{
        position: isSM ? 'absolute' : 'relative',
        width,
        left: 0,
        top: 0,
        padding: "0"
      }}>
        {sequence && sequence.map((time: number) => {

          const theTime = new Chronos(time);

          return (
            <div 
            key={time}
            style={{
              width: '100%',
              padding: '0 0.5rem'
            }}>
              <Typography
              
              component="p"
              sx={{
                display: 'flex',
                alignContent: 'center',
                fontSize: '0.7rem',
                height: standardHeight,
                borderBottom: '1px solid',
                borderColor: isSM ? "transparent" : time % 1 == 0 ? theme.palette.text.secondary : theme.palette.action.disabled,
                alignItems: 'flex-end',
                fontWeight: 700,
              }}
            >
              <span style={{
                height: "fit-content",
                padding: "0.1rem 0.15rem",
                backgroundColor: time % 1 === 0 && theTime.getAMP() === 'AM' ? 'white' : 'unset',
                color: theTime.getAMP() === 'AM' ? 'black' : 'lightGrey',
                borderRadius: "0.125rem"
              }}>
                {time === 12 ? `NOON` :
                  <>
                    {time % 1 === 0 && (
                      <>
                        <span>
                          {theTime.print(true, 1, false)}
                        </span>
                        <span
                        >{theTime.getAMP()}
                        </span>
                      </>
                    )}
                  </>
                }
              </span>
            </Typography>
            </div>

          )
        })}
      </div>
    </>
  );
}
