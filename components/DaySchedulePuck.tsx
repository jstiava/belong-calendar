"use client"
import * as React from 'react';
import { capitalize, CircularProgressProps, css, keyframes, styled } from "@mui/material";

const SIZE = 44;

const circularRotateKeyframe = keyframes`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`;

const circularDashKeyframe = keyframes`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: -126px;
  }
`;

// This implementation is for supporting both Styled-components v4+ and Pigment CSS.
// A global animation has to be created here for Styled-components v4+ (https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/utils/errors.md#12).
// which can be done by checking typeof indeterminate1Keyframe !== 'string' (at runtime, Pigment CSS transform keyframes`` to a string).
const rotateAnimation =
    typeof circularRotateKeyframe !== 'string'
        ? css`
        animation: ${circularRotateKeyframe} 1.4s linear infinite;
      `
        : null;

const dashAnimation =
    typeof circularDashKeyframe !== 'string'
        ? css`
        animation: ${circularDashKeyframe} 1.4s ease-in-out infinite;
      `
        : null;

const CircularProgressRoot = styled('span', {
    name: 'MuiCircularProgress',
    slot: 'Root',
    overridesResolver: (props, styles) => {
        const { ownerState } = props;

        return [
            styles.root,
            styles[ownerState.variant],
            styles[`color${capitalize(ownerState.color)}`],
        ];
    },
})(({ theme, ownerState }: any) => ({
    display: 'inline-block',
    ...(ownerState.variant === 'determinate' && {
        transition: theme.transitions.create('transform'),
    }),
    ...(ownerState.variant === 'indeterminate' && {
        animation: `${circularRotateKeyframe} 1.4s linear infinite`,
    }),
    // Add color styling from the theme
    ...(ownerState.color &&
        theme.palette[ownerState.color] && {
        color: theme.palette[ownerState.color].main,
    }),
}));

const CircularProgressSVG = styled<any>('svg', {
    name: 'MuiCircularProgress',
    slot: 'Svg',
    overridesResolver: (props, styles) => styles.svg,
})({
    display: 'block', // Keeps the progress centered
});

const CircularProgressCircle = styled<any>('circle', {
    name: 'MuiCircularProgress',
    slot: 'Circle',
    overridesResolver: (props, styles) => {
        const { ownerState } = props;

        return [
            styles.circle,
            styles[`circle${capitalize(ownerState.variant)}`],
            ownerState.disableShrink && styles.circleDisableShrink,
        ];
    },

})(({ theme, ownerState }: any) => ({
    stroke: 'currentColor',
    ...(ownerState.variant === 'determinate' && {
        style: {
            transition: theme.transitions.create('stroke-dashoffset'),
        },
    }),
    ...(ownerState.variant === 'indeterminate' && {
        style: {
            // Some default value that looks fine waiting for the animation to kicks in.
            strokeDasharray: '80px, 200px',
            strokeDashoffset: 0, // Add the unit to fix a Edge 16 and below bug.
        },
    }),
}));


export type DaySchedulePuckProps = {
    values?: number[],
    children: any,
} & CircularProgressProps;

/**
 * ## ARIA
 *
 * If the progress bar is describing the loading progress of a particular region of a page,
 * you should use `aria-describedby` to point to the progress bar, and set the `aria-busy`
 * attribute to `true` on that region until it has finished loading.
 */
const DaySchedulePuck = React.forwardRef(function CircularProgress(props: DaySchedulePuckProps, ref) {
    const {
        className,
        color = 'primary',
        disableShrink = false,
        size = 40,
        style,
        thickness = 3.6,
        value = 0,
        values = [],
        variant = 'indeterminate',
        children,
        ...other
    } = props;

    const ownerState: any = {
        ...props,
        color,
        disableShrink,
        size,
        thickness,
        value,
        variant,
    };

    const rootStyle: any = {};
    const rootProps: any = {};
    rootStyle.transform = `rotate(0deg)`;

    return (
        <CircularProgressRoot
            className={"flex center middle snug"}
            style={{ width: size, height: size, ...rootStyle, ...style }}
            ownerState={ownerState}
            ref={ref}
            role="progressbar"
            {...rootProps}
            {...other}
        >
            <div className="flex center middle" style={{
                position: 'absolute'
            }}>
                {children}
            </div>
            <>
                {values.map((x, i) => {

                    const circleStyle: any = {};
                    const circumference = 2 * Math.PI * ((SIZE - thickness) / 2);
                    const arc = x - values[i - 1];
                    circleStyle.strokeDasharray = `${(circumference).toFixed(3)}px`
                    circleStyle.strokeDashoffset = `${(((24 - arc) / 24) * circumference).toFixed(3)}px`;
                    circleStyle.strokeLinecap = 'round';

                    if (i % 2 === 0) {
                        return null;
                    }

                    return (
                        <CircularProgressSVG
                            key={x}
                            className={""}
                            viewBox={`${SIZE / 2} ${SIZE / 2} ${SIZE} ${SIZE}`}
                            ownerState={ownerState}
                            style={{
                                position: 'absolute',
                                transform: `rotate(${((values[i - 1] / 24) * 360) + 90}deg)`,
                                borderRadius: "50%",
                                background: 'transparent'
                            }}
                        >
                            <CircularProgressCircle
                                className={""}
                                style={circleStyle}
                                ownerState={ownerState}
                                cx={SIZE}
                                cy={SIZE}
                                r={(SIZE - thickness) / 2}
                                fill="none"
                                strokeWidth={thickness}
                            />
                        </CircularProgressSVG>
                    )
                })}
            </>
        </CircularProgressRoot>
    );
});

// CircularProgress.propTypes /* remove-proptypes */ = {
//   // ┌────────────────────────────── Warning ──────────────────────────────┐
//   // │ These PropTypes are generated from the TypeScript type definitions. │
//   // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
//   // └─────────────────────────────────────────────────────────────────────┘
//   /**
//    * Override or extend the styles applied to the component.
//    */
//   classes: PropTypes.object,
//   /**
//    * @ignore
//    */
//   className: PropTypes.string,
//   /**
//    * The color of the component.
//    * It supports both default and custom theme colors, which can be added as shown in the
//    * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
//    * @default 'primary'
//    */
//   color: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
//     PropTypes.oneOf(['inherit', 'primary', 'secondary', 'error', 'info', 'success', 'warning']),
//     PropTypes.string,
//   ]),
//   /**
//    * If `true`, the shrink animation is disabled.
//    * This only works if variant is `indeterminate`.
//    * @default false
//    */
//   disableShrink: chainPropTypes(PropTypes.bool, (props) => {
//     if (props.disableShrink && props.variant && props.variant !== 'indeterminate') {
//       return new Error(
//         'MUI: You have provided the `disableShrink` prop ' +
//           'with a variant other than `indeterminate`. This will have no effect.',
//       );
//     }

//     return null;
//   }),
//   /**
//    * The size of the component.
//    * If using a number, the pixel unit is assumed.
//    * If using a string, you need to provide the CSS unit, for example '3rem'.
//    * @default 40
//    */
//   size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
//   /**
//    * @ignore
//    */
//   style: PropTypes.object,
//   /**
//    * The system prop that allows defining system overrides as well as additional CSS styles.
//    */
//   sx: PropTypes.oneOfType([
//     PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
//     PropTypes.func,
//     PropTypes.object,
//   ]),
//   /**
//    * The thickness of the circle.
//    * @default 3.6
//    */
//   thickness: PropTypes.number,
//   /**
//    * The value of the progress indicator for the determinate variant.
//    * Value between 0 and 100.
//    * @default 0
//    */
//   value: PropTypes.number,
//   /**
//    * The variant to use.
//    * Use indeterminate when there is no progress value.
//    * @default 'indeterminate'
//    */
//   variant: PropTypes.oneOf(['determinate', 'indeterminate']),
// };

export default DaySchedulePuck;