import { UseCalendar } from '@/lib/useCalendar';
import { ArrowRight, ChevronLeft, ChevronRight } from '@mui/icons-material';
import Chronos from '@/lib/utils/chronos';
import dayjs from '@/lib/utils/dayjs';
import { useTheme, Typography, Tooltip, IconButton } from '@mui/material';

export default function WeekLegendColumn({
  width,
  Calendar,
  standardHeight,
}: {
  width: string,
  Calendar: UseCalendar,
  standardHeight: number;
}) {
  const theme = useTheme();

  return (
    <>
      <div style={{ width, padding: "0 0.5rem 0 0", }}>
        <div
          className="flex compact"
          style={{
            width: '100%',
            height: '5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'sticky',
            top: '0rem',
          }}
        >
        </div>
      </div>
    </>
  );
}
