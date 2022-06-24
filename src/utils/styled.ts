import get from 'lodash.get';
import {
  COLOR_SCHEME_MAP,
  pseudoPropStateMap,
  PSEUDO_PROP_COMPONENT_MAP,
  resolvedStyledMap,
} from '../core/ResolvedStyleMap';
//@ts-ignore
// eslint-disable-next-line dot-notation
// window['StyleSheet'] = StyleSheet;
import { getStyledObject } from './getStyledComponentAndObjects';
import {
  get as getResolvedStyleMap,
  set as setResolvedStyleMap,
} from '../core/ResolvedStyleMap';
import { theme } from '../theme';

console.log('one here ****');
// window['logger'] = {};
// console.batchTime = (key) => {
//   const keyValue = window['logger'][key];
//   if (keyValue) {
//     // keyValue.totalTime = keyValue.totalTime + (Date.now() - keyValue.startTime);
//     keyValue.startTime = window.performance.now();
//   } else {
//     window['logger'][key] = {
//       startTime: window.performance.now(),
//       totalTime: 0,
//     };
//   }
// };

// console.batchTimeEnd = (key) => {
//   const keyValue = window['logger'][key];
//   if (keyValue) {
//     keyValue.totalTime =
//       keyValue.totalTime + (window.performance.now() - keyValue.startTime);
//     // console.log(
//     //   "useStyledSystemPropsResolver 2222",
//     //   keyValue,
//     //   window.performance.now()
//     // );
//   }
// };

const resolveForInternalPseudoProps = (
  name: any,
  key: any,
  styledObj: any,
  config: any,
  mergeDefaultProps: boolean = true
) => {
  // if (name !== 'Button') {
  //   return;
  // }
  for (const property in styledObj.internalPseudoProps) {
    if (PSEUDO_PROP_COMPONENT_MAP[property]) {
      // if (key === 'Button.sm') {
      //   console.log(
      //     mergeDefaultProps,
      //     key,
      //     PSEUDO_PROP_COMPONENT_MAP[property],
      //     '******'
      //   );
      // }
      updateComponentThemeMapForColorMode(
        PSEUDO_PROP_COMPONENT_MAP[property],
        `${key}.${PSEUDO_PROP_COMPONENT_MAP[property]}`,
        styledObj.internalPseudoProps[property],
        config.colorMode,
        false,
        mergeDefaultProps
      );
    } else {
      // const themeProps = getThemeProps(name, colorMode, {
      //   [pseudoPropStateMap[property]]: true,
      // });

      // if (property === '_hover') {
      //   console.log(
      //     // name,
      //     // property,
      //     // pseudoPropStateMap[property],
      //     themeProps,
      //     {
      //       ...themeProps.styleFromProps,
      //       ...styledObj.internalPseudoProps[property],
      //     },
      //     'theme props '
      //   );
      // }

      const styledObjNestedProp: any = getStyledObject(
        name,
        {},
        config,
        styledObj.internalPseudoProps[property]
      );

      const componentMapPath = key;
      const componentObj = getResolvedStyleMap(componentMapPath);

      if (componentObj) {
        // const stateKey = key.slice(componentMapPath.length + 1);
        if (pseudoPropStateMap[property]) {
          const stateKey = property;
          if (componentObj[stateKey]) {
            if (!componentObj[stateKey][config.colorMode]) {
              componentObj[stateKey][config.colorMode] = [];
            }
            componentObj[stateKey][config.colorMode].push(styledObjNestedProp);
          } else {
            componentObj[stateKey] = {
              [config.colorMode]: [styledObjNestedProp],
            };
          }
        } else {
          // console.log(
          //   'hello here &&&*',
          //   styledObj.internalPseudoProps[property]
          // );
          componentObj[config.colorMode][0].unResolvedProps = {
            ...componentObj[config.colorMode][0].unResolvedProps,
            [property]: styledObj.internalPseudoProps[property],
          };
        }
      }
    }
  }
};

const updateComponentThemeMapForColorMode = (
  name: string,
  key: string,
  inputProps?: {},
  config: any = {
    colorMode: 'light',
    platform: 'web',
  },
  resolveForStatePseudoProps: boolean = false,
  mergeDefaultProps: boolean = true
) => {
  let componentTheme = get(theme, `components.${name}`, {});
  // resolve for variant

  if (resolveForStatePseudoProps) {
    componentTheme = {};
  }

  const styledObj: any = getStyledObject(
    name,
    componentTheme,
    config,
    {
      ...inputProps,
      extraProp: key,
    },
    mergeDefaultProps
  );

  setResolvedStyleMap(key, styledObj, config.colorMode);

  resolveForInternalPseudoProps(
    name,
    key,
    styledObj,
    config,
    mergeDefaultProps
  );

  return styledObj;
};

export const resolveDefaultTheme = (platform?: string) => {
  for (const key in theme.components) {
    updateComponentThemeMap(key, {}, platform);
  }
  return resolvedStyledMap;
};

export const updateComponentThemeMap = (
  name: string,
  inputProps?: {},
  platform?: string
) => {
  updateComponentThemeMapForColorMode(name, name, inputProps, {
    colorMode: 'light',
    platform,
  });
  updateComponentThemeMapForColorMode(name, name, inputProps, {
    colorMode: 'dark',
    platform,
  });

  // resolve for all variants
  const componentTheme = get(theme, `components.${name}`, {});

  // resolve for colors only for button

  // updateComponentThemeMapForColorMode(
  //   name,
  //   `${name}.baseStyle`,
  //   inputProps,
  //   'light'
  //   // true
  // );

  if (COLOR_SCHEME_MAP[name]) {
    for (const color in theme.colors) {
      if (
        ![
          'white',
          'black',
          'lightText',
          'darkText',
          'contrastThreshold',
        ].includes(color)
      ) {
        updateComponentThemeMapForColorMode(
          name,
          `${name}.${color}`,
          { colorScheme: color },
          {
            colorMode: 'light',
            platform,
          }
          // true
        );

        updateComponentThemeMapForColorMode(
          name,
          `${name}.${color}`,
          { colorScheme: color },
          {
            colorMode: 'dark',
            platform,
          }
          // true
        );

        for (const variant in componentTheme.variants) {
          updateComponentThemeMapForColorMode(
            name,
            `${name}.${color}.${variant}`,
            { variant: variant, colorScheme: color },
            {
              colorMode: 'light',
              platform,
            }
            // true
          );

          updateComponentThemeMapForColorMode(
            name,
            `${name}.${color}.${variant}`,
            { variant: variant, colorScheme: color },
            {
              colorMode: 'dark',
              platform,
            }
            // true
          );
        }
      }
      // console.log(color, 'hello &&&&&');
    }
  } else {
    for (const variant in componentTheme.variants) {
      updateComponentThemeMapForColorMode(
        name,
        `${name}.${variant}`,
        { variant: variant },
        {
          colorMode: 'light',
          platform,
        }
        // true
      );
      updateComponentThemeMapForColorMode(
        name,
        `${name}.${variant}`,
        { variant: variant },
        {
          colorMode: 'dark',
          platform,
        }
      );
    }
  }

  // resolve for all sizes
  for (const size in componentTheme.sizes) {
    updateComponentThemeMapForColorMode(
      name,
      `${name}.${size}`,
      { size: size },
      {
        colorMode: 'light',
        platform,
      },
      false,
      false
    );
    updateComponentThemeMapForColorMode(
      name,
      `${name}.${size}`,
      { size: size },
      {
        colorMode: 'dark',
        platform,
      },
      false,
      false
    );
  }

  // resolve for all variants and sizes
  // for (const variant in componentTheme.variants) {
  //   for (const size in componentTheme.sizes) {
  //     updateComponentThemeMapForColorMode(
  //       name,
  //       `${name}.${variant}.${size}`,
  //       { size: size, variant: variant },
  //       'light'
  //     );
  //     updateComponentThemeMapForColorMode(
  //       name,
  //       `${name}.${variant}.${size}`,
  //       { size: size, variant: variant },
  //       'dark'
  //     );
  //   }
  // }
};

console.time('resolveTheme>>>> ALL');

console.timeEnd('resolveTheme>>>> ALL');

export * from '../core/ResolvedStyleMap';
// for (const key in theme.components) {
// }

// updateComponentThemeMap('Icon');