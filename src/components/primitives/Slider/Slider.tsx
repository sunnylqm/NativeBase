import React, { forwardRef, memo } from 'react';
import { useSliderState } from '@react-stately/slider';
import { useLayout } from '../../../hooks';
import { usePropsResolution } from '../../../hooks';
import type { ISliderProps } from './types';
import Box from '../Box';
import { SliderContext } from './Context';
import { useSlider } from '@react-native-aria/slider';

function Slider(
  { isDisabled, isReadOnly, ...props }: ISliderProps & { variant?: string },
  ref?: any
) {
  const newProps = {
    ...props,
    'aria-label': props.accessibilityLabel ?? 'Slider',
    // 'orientation': props.orientation || 'horizontal',
    'variant': props.orientation || 'horizontal',
  };

  if (typeof props.value === 'number') {
    //@ts-ignore - React Native Aria slider accepts array of values
    newProps.value = [props.value];
  }

  if (typeof props.defaultValue === 'number') {
    //@ts-ignore - React Native Aria slider accepts array of values
    newProps.defaultValue = [props.defaultValue];
  }

  props = newProps;

  const { onLayout, layout: trackLayout } = useLayout();
  const updatedProps: ISliderProps = Object.assign({}, props);

  if (isReadOnly || isDisabled) {
    updatedProps.isDisabled = true;
  }

  const state = useSliderState({
    ...updatedProps,
    //@ts-ignore
    numberFormatter: { format: (e) => e },
    minValue: props.minValue,
    maxValue: props.maxValue,
    onChange: (val: any) => {
      props.onChange && props.onChange(val[0]);
    },
    onChangeEnd: (val: any) => {
      props.onChangeEnd && props.onChangeEnd(val[0]);
    },
  });

  const resolvedProps = usePropsResolution('Slider', props, {
    isDisabled,
    isReadOnly,
  });

  const { trackProps } = useSlider(
    (props as unknown) as any,
    state,
    trackLayout
  );

  const contextValue = React.useMemo(() => {
    return {
      trackLayout,
      state,
      orientation: props.orientation,
      isDisabled: isDisabled,
      isReversed: props.isReversed,
      colorScheme: props.colorScheme,
      trackProps,
      isReadOnly: isReadOnly,
      onTrackLayout: onLayout,
      thumbSize: resolvedProps.thumbSize,
      sliderSize: resolvedProps.sliderTrackHeight,
      _interactionBox: resolvedProps._interactionBox,
      // _sliderTrack: resolvedProps._sliderTrack,
      _sliderFilledTrack: resolvedProps._sliderFilledTrack,
      variant: props.variant,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    trackLayout,
    state,
    // props.orientation,
    isDisabled,
    props.isReversed,
    props.colorScheme,
    isReadOnly,
    onLayout,
    props.variant,
    resolvedProps.thumbSize,
    resolvedProps.sliderTrackHeight,
    // resolvedProps._sliderTrack,
    resolvedProps._sliderFilledTrack,
  ]);

  // console.log(resolvedProps.variant, props, 'variant here');

  return (
    <SliderContext.Provider value={contextValue}>
      <Box {...resolvedProps} ref={ref}>
        {React.Children.map(props.children, (child, index) => {
          if (child.displayName === 'SliderThumb') {
            return React.cloneElement(child as React.ReactElement, {
              index,
            });
          }

          return child;
        })}
      </Box>
    </SliderContext.Provider>
  );
}

export default memo(forwardRef(Slider));
