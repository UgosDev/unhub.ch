import React, { type FC, type ReactNode, type SVGProps } from 'react';

// --- LOGHI ---

interface ScansioniChLogoIconProps extends SVGProps<SVGSVGElement> {
  lightFill?: string;
  darkFill?: string;
}

export const ScansioniChLogoIcon: FC<ScansioniChLogoIconProps> = ({ lightFill, darkFill, ...props }) => (
    <svg id="Livello_5" data-name="Livello 5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768.26 1477.64" {...props}>
      <polygon fill={lightFill || "#c6a1fc"} points="768.18 739.16 768.18 1034.82 512.19 886.99 512.19 887.02 512.15 887.02 512.12 886.99 0 591.33 .07 591.29 .07 591.33 256.06 443.53 256.09 443.53 512.12 591.33 768.18 739.16"/>
      <polygon fill={darkFill || "#9e5bfe"} points="512.19 0 512.19 295.66 256.13 443.49 256.09 443.53 256.06 443.53 256.06 443.49 .07 591.29 .07 295.66 512.19 0"/>
      <polygon fill={darkFill || "#9e5bfe"} points="768.26 1034.87 512.2 1182.7 256.14 1330.53 255.53 1330.15 .08 1477.64 .08 1182.7 256.14 1034.87 512.17 887.04 512.2 887.04 768.19 1034.87 768.19 1034.83 768.26 1034.87"/>
    </svg>
);

interface ScansioniChLevelIndicatorIconProps extends SVGProps<SVGSVGElement> {
  middleClassName?: string;
  topBottomClassName?: string;
}

export const ScansioniChLevelIndicatorIcon: FC<ScansioniChLevelIndicatorIconProps> = ({ middleClassName, topBottomClassName, ...props }) => (
    <svg id="Livello_5_LevelIndicator" data-name="Livello 5 LevelIndicator" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768.26 1477.64" {...props}>
      <polygon className={middleClassName} fill="currentColor" points="768.18 739.16 768.18 1034.82 512.19 886.99 512.19 887.02 512.15 887.02 512.12 886.99 0 591.33 .07 591.29 .07 591.33 256.06 443.53 256.09 443.53 512.12 591.33 768.18 739.16"/>
      <polygon className={topBottomClassName} fill="currentColor" points="512.19 0 512.19 295.66 256.13 443.49 256.09 443.53 256.06 443.53 256.06 443.49 .07 591.29 .07 295.66 512.19 0"/>
      <polygon className={topBottomClassName} fill="currentColor" points="768.26 1034.87 512.2 1182.7 256.14 1330.53 255.53 1330.15 .08 1477.64 .08 1182.7 256.14 1034.87 512.17 887.04 512.2 887.04 768.19 1034.87 768.19 1034.83 768.26 1034.87"/>
    </svg>
);

interface ScansioniChWordmarkIconProps extends SVGProps<SVGSVGElement> {
  lightFill?: string;
  darkFill?: string;
}

export const ScansioniChWordmarkIcon: FC<ScansioniChWordmarkIconProps> = ({ lightFill, darkFill, ...props }) => (
  <svg
    id="Livello_5_Wordmark"
    data-name="Livello 5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 548.81 69.01"
    {...props}
  >
    <g>
      <path fill={darkFill || "#9e5bfe"} d="M10.44,66.88c-3.13-1.42-5.61-3.35-7.44-5.79S.17,55.96,0,53h12.27c.23,1.86,1.14,3.39,2.74,4.61,1.6,1.22,3.58,1.83,5.96,1.83s4.13-.46,5.44-1.39c1.3-.93,1.96-2.12,1.96-3.57,0-1.57-.8-2.74-2.4-3.53-1.59-.78-4.13-1.64-7.61-2.57-3.6-.87-6.54-1.77-8.83-2.7-2.29-.93-4.26-2.35-5.92-4.27-1.65-1.91-2.48-4.49-2.48-7.75,0-2.67.77-5.1,2.31-7.31,1.54-2.2,3.74-3.94,6.61-5.22,2.87-1.27,6.25-1.91,10.14-1.91,5.75,0,10.33,1.44,13.75,4.31,3.42,2.87,5.31,6.75,5.66,11.62h-11.66c-.18-1.91-.97-3.44-2.4-4.57-1.42-1.13-3.32-1.7-5.7-1.7-2.2,0-3.9.41-5.09,1.22-1.19.81-1.78,1.94-1.78,3.39,0,1.63.81,2.86,2.44,3.7,1.62.84,4.15,1.7,7.57,2.57,3.48.87,6.36,1.77,8.62,2.7,2.26.93,4.22,2.37,5.87,4.31,1.65,1.94,2.51,4.51,2.57,7.7,0,2.79-.77,5.28-2.31,7.48-1.54,2.21-3.74,3.93-6.61,5.18-2.87,1.25-6.22,1.87-10.05,1.87s-7.48-.71-10.62-2.13Z"/>
      <path fill={darkFill || "#9e5bfe"} d="M49.96,31.03c2.03-3.74,4.84-6.64,8.44-8.7,3.6-2.06,7.72-3.09,12.36-3.09,5.98,0,10.92,1.49,14.84,4.48,3.92,2.99,6.54,7.18,7.88,12.58h-13.14c-.7-2.09-1.87-3.73-3.53-4.92-1.65-1.19-3.7-1.78-6.14-1.78-3.48,0-6.24,1.26-8.27,3.78-2.03,2.52-3.04,6.11-3.04,10.75s1.01,8.14,3.04,10.66,4.79,3.78,8.27,3.78c4.93,0,8.15-2.2,9.66-6.61h13.14c-1.33,5.22-3.97,9.37-7.92,12.45-3.95,3.08-8.88,4.61-14.8,4.61-4.64,0-8.76-1.03-12.36-3.09-3.6-2.06-6.41-4.96-8.44-8.7s-3.05-8.11-3.05-13.1,1.02-9.36,3.05-13.1Z"/>
      <path fill={darkFill || "#9e5bfe"} d="M102.21,30.98c1.94-3.77,4.58-6.67,7.92-8.7,3.33-2.03,7.06-3.05,11.18-3.05,3.6,0,6.75.73,9.44,2.18,2.7,1.45,4.86,3.28,6.48,5.48v-6.88h12.27v48.21h-12.27v-7.05c-1.57,2.26-3.73,4.13-6.48,5.61-2.76,1.48-5.93,2.22-9.53,2.22-4.06,0-7.76-1.04-11.1-3.13-3.34-2.09-5.98-5.03-7.92-8.83-1.94-3.8-2.92-8.17-2.92-13.1s.97-9.2,2.92-12.97ZM135.5,36.51c-1.16-2.12-2.73-3.74-4.7-4.87-1.97-1.13-4.09-1.7-6.35-1.7s-4.35.55-6.27,1.65c-1.91,1.1-3.47,2.71-4.66,4.83-1.19,2.12-1.78,4.63-1.78,7.53s.59,5.44,1.78,7.61c1.19,2.18,2.76,3.85,4.7,5,1.94,1.16,4.02,1.74,6.22,1.74s4.38-.57,6.35-1.7c1.97-1.13,3.54-2.75,4.7-4.87,1.16-2.12,1.74-4.65,1.74-7.61s-.58-5.5-1.74-7.61Z"/>
      <path fill={darkFill || "#9e5bfe"} d="M202.08,24.76c3.54,3.63,5.31,8.69,5.31,15.19v28.29h-12.18v-26.63c0-3.83-.96-6.77-2.87-8.83-1.91-2.06-4.52-3.09-7.83-3.09s-6.02,1.03-7.96,3.09c-1.94,2.06-2.92,5-2.92,8.83v26.63h-12.18V20.02h12.18v6c1.62-2.09,3.7-3.73,6.22-4.92,2.53-1.19,5.3-1.79,8.31-1.79,5.74,0,10.38,1.81,13.92,5.44Z"/>
      <path fill={darkFill || "#9e5bfe"} d="M226.8,66.88c-3.13-1.42-5.61-3.35-7.44-5.79-1.83-2.44-2.83-5.14-3-8.1h12.27c.23,1.86,1.14,3.39,2.74,4.61,1.6,1.22,3.58,1.83,5.96,1.83s4.13-.46,5.44-1.39c1.3-.93,1.96-2.12,1.96-3.57,0-1.57-.8-2.74-2.4-3.53-1.59-.78-4.13-1.64-7.61-2.57-3.6-.87-6.54-1.77-8.83-2.7-2.29-.93-4.26-2.35-5.92-4.27-1.65-1.91-2.48-4.49-2.48-7.75,0-2.67.77-5.1,2.31-7.31,1.54-2.2,3.74-3.94,6.61-5.22,2.87-1.27,6.25-1.91,10.14-1.91,5.75,0,10.33,1.44,13.75,4.31,3.42,2.87,5.31,6.75,5.66,11.62h-11.66c-.18-1.91-.97-3.44-2.4-4.57-1.42-1.13-3.32-1.7-5.7-1.7-2.2,0-3.9.41-5.09,1.22-1.19.81-1.78,1.94-1.78,3.39,0,1.63.81,2.86,2.44,3.7,1.62.84,4.15,1.7,7.57,2.57,3.48.87,6.36,1.77,8.62,2.7,2.26.93,4.22,2.37,5.87,4.31,1.65,1.94,2.51,4.51,2.57,7.7,0,2.79-.77,5.28-2.31,7.48-1.54,2.21-3.74,3.93-6.61,5.18-2.87,1.25-6.22,1.87-10.05,1.87s-7.48-.71-10.62-2.13Z"/>
      <path fill={darkFill || "#9e5bfe"} d="M267.22,12.23c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.21-2.04,5.35-2.04s3.93.68,5.35,2.04c1.42,1.36,2.13,3.06,2.13,5.09s-.71,3.73-2.13,5.09c-1.42-1.36-3.21,2.05-5.35,2.05s-3.93-.68-5.35-2.05ZM278.58,20.02v48.21h-12.18V20.02h12.18Z"/>
      <path fill={darkFill || "#9e5bfe"} d="M299.47,65.93c-3.71-2.06-6.63-4.97-8.75-8.75-2.12-3.77-3.18-8.12-3.18-13.05s1.09-9.28,3.26-13.05c2.18-3.77,5.15-6.69,8.92-8.75,3.77-2.06,7.98-3.09,12.62-3.09s8.85,1.03,12.62,3.09c3.77,2.06,6.75,4.98,8.92,8.75,2.18,3.77,3.26,8.12,3.26,13.05s-1.12,9.28-3.35,13.05c-2.23,3.77-5.25,6.69-9.05,8.75-3.8,2.06-8.05,3.09-12.75,3.09s-8.82-1.03-12.53-3.09ZM318.22,56.79c1.94-1.07,3.49-2.68,4.65-4.83,1.16-2.14,1.74-4.76,1.74-7.83,0-4.58-1.2-8.11-3.61-10.57-2.41-2.47-5.35-3.7-8.83-3.7s-6.4,1.23-8.75,3.7c-2.35,2.47-3.52,5.99-3.52,10.57s1.14,8.11,3.44,10.57c2.29,2.47,5.18,3.7,8.66,3.7,2.21,0,4.28-.54,6.22-1.61Z"/>
      <path fill={darkFill || "#9e5bfe"} d="M386.76,24.76c3.54,3.63,5.31,8.69,5.31,15.19v28.29h-12.18v-26.63c0-3.83-.96-6.77-2.87-8.83-1.91-2.06-4.52-3.09-7.83-3.09s-6.02,1.03-7.96,3.09c-1.94,2.06-2.92,5-2.92,8.83v26.63h-12.18V20.02h12.18v6c1.62-2.09,3.7-3.73,6.22-4.92,2.53-1.19,5.3-1.79,8.31-1.79,5.74,0,10.38,1.81,13.92,5.44Z"/>
      <path fill={darkFill || "#9e5bfe"} d="M404.47,12.23c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.21-2.04,5.35-2.04s3.93.68,5.35,2.04c1.42,1.36,2.13,3.06,2.13,5.09s-.71,3.73-2.13,5.09c-1.42,1.36-3.21,2.05-5.35,2.05s-3.93-.68-5.35-2.05ZM415.82,20.02v48.21h-12.18V20.02h12.18Z"/>
    </g>
    <g>
      <path fill={lightFill || "#c6a1fc"} d="M427.79,66.79c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.23-2.04,5.44-2.04s3.92.68,5.31,2.04c1.39,1.36,2.09,3.06,2.09,5.09s-.7,3.73-2.09,5.09c-1.39,1.36-3.16,2.05-5.31,2.05s-4.02-.68-5.44-2.05Z"/>
      <path fill={lightFill || "#c6a1fc"} d="M450.38,31.03c2.03-3.74,4.84-6.64,8.44-8.7,3.6-2.06,7.72-3.09,12.36-3.09,5.98,0,10.92,1.49,14.84,4.48,3.92,2.99,6.54,7.18,7.88,12.58h-13.14c-.7-2.09-1.87-3.73-3.53-4.92-1.65-1.19-3.7-1.78-6.14-1.78-3.48,0-6.24,1.26-8.27,3.78-2.03,2.52-3.04,6.11-3.04,10.75s1.01,8.14,3.04,10.66,4.79,3.78,8.27,3.78c4.93,0,8.15-2.2,9.66-6.61h13.14c-1.33,5.22-3.97,9.37-7.92,12.45-3.95,3.08-8.88,4.61-14.8,4.61-4.64,0-8.76-1.03-12.36-3.09-3.6-2.06-6.41-4.96-8.44-8.7-2.03,3.74-3.05-8.11-3.05-13.1s1.02-9.36,3.05-13.1Z"/>
      <path fill={lightFill || "#c6a1fc"} d="M539.75,21.72c2.84,1.59,5.06,3.94,6.66,7.05,1.6,3.1,2.4,6.83,2.4,11.18v28.29h-12.18v-26.63c0-3.83-.96-6.77-2.87-8.83-1.91-2.06-4.52-3.09-7.83-3.09s-6.02,1.03-7.96,3.09c-1.94,2.06-2.92,5-2.92,8.83v26.63h-12.18V3.83h12.18v22.19c1.57-2.09,3.65-3.73,6.27-4.92,2.61-1.19,5.51-1.79,8.7-1.79,3.65,0,6.9.8,9.75,2.4Z"/>
    </g>
  </svg>
);

export const ArchivioChLogoIcon: FC<ScansioniChLogoIconProps> = ({ lightFill, darkFill, ...props }) => (
    <svg id="Livello_5" data-name="Livello 5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768.26 1477.64" {...props}>
      <polygon fill={lightFill || "#fca5a5"} points="768.18 739.16 768.18 1034.82 512.19 886.99 512.19 887.02 512.15 887.02 512.12 886.99 0 591.33 .07 591.29 .07 591.33 256.06 443.53 256.09 443.53 512.12 591.33 768.18 739.16"/>
      <polygon fill={darkFill || "#b91c1c"} points="512.19 0 512.19 295.66 256.13 443.49 256.09 443.53 256.06 443.53 256.06 443.49 .07 591.29 .07 295.66 512.19 0"/>
      <polygon fill={darkFill || "#b91c1c"} points="768.26 1034.87 512.2 1182.7 256.14 1330.53 255.53 1330.15 .08 1477.64 .08 1182.7 256.14 1034.87 512.17 887.04 512.2 887.04 768.19 1034.87 768.19 1034.83 768.26 1034.87"/>
    </svg>
);

export const PolizzeChLogoIcon: FC<ScansioniChLogoIconProps> = ({ lightFill, darkFill, ...props }) => (
    <svg id="Livello_5" data-name="Livello 5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768.26 1477.64" {...props}>
      <polygon fill={lightFill || "#67e8f9"} points="768.18 739.16 768.18 1034.82 512.19 886.99 512.19 887.02 512.15 887.02 512.12 886.99 0 591.33 .07 591.29 .07 591.33 256.06 443.53 256.09 443.53 512.12 591.33 768.18 739.16"/>
      <polygon fill={darkFill || "#0e7490"} points="512.19 0 512.19 295.66 256.13 443.49 256.09 443.53 256.06 443.53 256.06 443.49 .07 591.29 .07 295.66 512.19 0"/>
      <polygon fill={darkFill || "#0e7490"} points="768.26 1034.87 512.2 1182.7 256.14 1330.53 255.53 1330.15 .08 1477.64 .08 1182.7 256.14 1034.87 512.17 887.04 512.2 887.04 768.19 1034.87 768.19 1034.83 768.26 1034.87"/>
    </svg>
);

export const DisdetteChLogoIcon: FC<ScansioniChLogoIconProps> = ({ lightFill, darkFill, ...props }) => (
    <svg id="Livello_5" data-name="Livello 5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768.26 1477.64" {...props}>
      <polygon fill={lightFill || "#86efac"} points="768.18 739.16 768.18 1034.82 512.19 886.99 512.19 887.02 512.15 887.02 512.12 886.99 0 591.33 .07 591.29 .07 591.33 256.06 443.53 256.09 443.53 512.12 591.33 768.18 739.16"/>
      <polygon fill={darkFill || "#15803d"} points="512.19 0 512.19 295.66 256.13 443.49 256.09 443.53 256.06 443.53 256.06 443.49 .07 591.29 .07 295.66 512.19 0"/>
      <polygon fill={darkFill || "#15803d"} points="768.26 1034.87 512.2 1182.7 256.14 1330.53 255.53 1330.15 .08 1477.64 .08 1182.7 256.14 1034.87 512.17 887.04 512.2 887.04 768.19 1034.87 768.19 1034.83 768.26 1034.87"/>
    </svg>
);

// --- WORDMARKS ---

const textSvgProps = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "60",
    fontWeight: "bold",
    y: "55"
};

export const ArchivioChWordmarkIcon: FC<ScansioniChWordmarkIconProps> = ({ lightFill, darkFill, ...props }) => (
  <svg viewBox="0 0 490 70" {...props}>
    <text {...textSvgProps} x="0" fill={darkFill || "#b91c1c"}>archivio</text>
    <text {...textSvgProps} x="300" fill={lightFill || "#f87171"}>.ch</text>
  </svg>
);

export const PolizzeChWordmarkIcon: FC<ScansioniChWordmarkIconProps> = ({ lightFill, darkFill, ...props }) => (
  <svg viewBox="0 0 450 70" {...props}>
    <text {...textSvgProps} x="0" fill={darkFill || "#0e7490"}>polizze</text>
    <text {...textSvgProps} x="260" fill={lightFill || "#67e8f9"}>.ch</text>
  </svg>
);

export const DisdetteChWordmarkIcon: FC<ScansioniChWordmarkIconProps> = ({ lightFill, darkFill, ...props }) => (
  <svg viewBox="0 0 500 70" {...props}>
    <text {...textSvgProps} x="0" fill={darkFill || "#15803d"}>disdette</text>
    <text {...textSvgProps} x="310" fill={lightFill || "#86efac"}>.ch</text>
  </svg>
);

export const UnHubChWordmarkIcon: FC<ScansioniChWordmarkIconProps> = ({ lightFill, darkFill, ...props }) => (
  <svg viewBox="0 0 420 70" {...props}>
    <text {...textSvgProps} x="0" fill={darkFill || "#ffffff"}>UnHub</text>
    <text {...textSvgProps} x="230" fill={lightFill || "#c6a1fc"}>.ch</text>
  </svg>
);

// --- GENERIC ICONS ---
// Most are from Heroicons (https://heroicons.com/)

interface IconProps extends SVGProps<SVGSVGElement> {
    title?: string;
}

const Icon: FC<IconProps> = ({ children, title, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        {title && <title>{title}</title>}
        {children}
    </svg>
);

export const ArrowDownIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></Icon>;
export const ArrowPathIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.18-3.185m-3.181 9.995l-3.182-3.182m0 0a8.25 8.25 0 0111.664 0l3.18 3.183" /></Icon>;
export const ArrowsPointingOutIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></Icon>;
export const ArrowsRightLeftIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h18m-7.5-1.5L21 9m0 0l-3.5-3.5M21 9H3" /></Icon>;
export const ArrowUpIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" /></Icon>;
export const ArrowUturnLeftIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></Icon>;
export const ArrowUturnRightIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" /></Icon>;
export const Bars3Icon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></Icon>;
export const BoltIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></Icon>;
export const BoltSlashIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.412 15.655L9.75 21.75l2.25-8.25H3.75l2.25-8.25h6.912l-2.25 8.25h4.938l-1.125-4.125m-2.875 9.375l1.5-5.25m-3.75 3l3.75-3.75m-7.5 7.5l7.5-7.5" /></Icon>;
export const BoltAutoIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75l2.25-8.25H18L12 3l-2.25 8.25H6L12 21.75zM15.75 12a3.75 3.75 0 010-7.5H18" /></Icon>;
export const BookOpenIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></Icon>;
export const BuildingOffice2Icon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.793V21H3v-8.207l9-9 9 9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 21h4v-5h-4v5zM8 21h4v-5H8v5zM3 21h4v-5H3v5z" /></Icon>;
export const CameraIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008v-.008z" /></Icon>;
export const ChatBubbleLeftRightIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72.35c-1.063.1-2.028-.354-2.636-1.182-.385-.52-.385-1.23 0-1.75.608-.828 1.573-1.282 2.636-1.182l3.72.35zM4.5 15.422V9.574c0-.97.616-1.813 1.5-2.097l3.72-.35c1.063-.1 2.028.354 2.636 1.182.385.52.385-1.23 0 1.75-.608.828-1.573-1.282-2.636-1.182l-3.72-.35z" /></Icon>;
export const CheckCircleIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>;
export const CheckIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></Icon>;
export const ChevronDownIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></Icon>;
export const ChevronRightIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></Icon>;
export const ChevronUpIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></Icon>;
export const ClipboardDocumentCheckIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-1.125 0-2.25.9-2.25 2.25v13.5c0 1.125.9 2.25 2.25 2.25h9c1.125 0 2.25-.9 2.25-2.25v-9.75M14.25 9l-3.75 3.75-1.5-1.5M12 9h.008v.008H12V9z" /></Icon>;
export const ClipboardDocumentIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-1.125 0-2.062-.938-1.976-2.062a48.427 48.427 0 011.123-.08m3.101 1.911c.065-.21.1-.433.1-.664a2.25 2.25 0 01.1-.664m-6.26 0C4.846 2.15 5.69 1.5 6.6 1.5h1.5a2.25 2.25 0 012.25 2.25v1.513c0 .541-.21.998-.6 1.357L6.6 15.632V21.75a2.25 2.25 0 002.25 2.25h5.379c.608 0 1.157-.26 1.536-.69l2.7-3.6" /></Icon>;
export const ClockIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>;
export const CogIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.008 1.134-1.134.573-.126 1.157-.126 1.73 0 .574.126 1.044.592 1.134 1.134.09.542.09 1.158 0 1.73-.126.573-.592 1.044-1.134 1.134-.573.126-1.157.126-1.73 0-.574-.126-1.044-.592-1.134-1.134a4.49 4.49 0 010-1.73zM12 15.75c-2.072 0-3.75-1.678-3.75-3.75s1.678-3.75 3.75-3.75 3.75 1.678 3.75 3.75-1.678 3.75-3.75 3.75z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>;
export const CoinIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 100 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>;
export const ComputerDesktopIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" /></Icon>;
export const CreditCardIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6.25 3h6.25M3.75 15.75h7.5M3 12h18M3 7.5h18m-18 9.75h18A2.25 2.25 0 0021 15V5.25A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25v12z" /></Icon>;
export const DocumentDuplicateIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></Icon>;
export const DocumentPlusIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3h-6M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></Icon>;
export const DocumentTextIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></Icon>;
export const DownloadIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></Icon>;
export const EllipsisVerticalIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></Icon>;
export const EnvelopeIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></Icon>;
export const EyeIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></Icon>;
export const FastForwardIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5V18M15 7.5V18M3 16.5l7.5-9L3 7.5v9zM12 16.5l7.5-9L12 7.5v9z" /></Icon>;
export const FileIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m-3.75 0H9m-3.75 0h.008v.008H5.25v-.008zM5.25 9h.008v.008H5.25V9zm.008 2.25h.008v.008H5.258v-.008zm-3.008 2.25h.008v.008H2.25v-.008z" /></Icon>;
export const FolderIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></Icon>;
export const FolderPlusIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3h-6M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></Icon>;
export const GoogleIcon: FC<IconProps> = (props) => <svg viewBox="0 0 48 48" {...props}><path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" /></svg>;
export const HandThumbDownIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.275a2.25 2.25 0 013.445-1.13 22.49 22.49 0 012.724 4.135 2.25 2.25 0 002.348 1.491h3.11a2.25 2.25 0 012.193 2.502l-1.212 6.06a2.25 2.25 0 01-2.193 2.002H16.5m-6.45-16.5a2.25 2.25 0 01-1.13 3.445l-4.275 2.138a2.25 2.25 0 00-1.13 3.445l4.275 2.138a2.25 2.25 0 001.13 3.445" /></Icon>;
export const HandThumbUpIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M6.633 10.5l-1.89-1.89A.75.75 0 015.25 8.25h.411c.22 0 .415.083.56.23l1.89 1.89M6.633 10.5a2.25 2.25 0 00-2.25-2.25H4.133a2.25 2.25 0 00-2.25 2.25v6.75A2.25 2.25 0 004.133 19.5h2.499a2.25 2.25 0 002.25-2.25v-6.75z" /></Icon>;
export const InformationCircleIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></Icon>;
export const LayersIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L12 15.25l5.571-3m-11.142 0L12 6.75l5.571 3" /></Icon>;
export const LightBulbIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189c1.025-.262 1.933-.698 2.724-1.293a3.75 3.75 0 10-7.448 0c.79.595 1.7 1.031 2.724 1.293A6.01 6.01 0 0012 12.75zm-2.25.75a2.25 2.25 0 01-2.25-2.25v-.812c0-.663.269-1.265.707-1.707a2.25 2.25 0 013.586 0c.438.442.707 1.044.707 1.707v.812a2.25 2.25 0 01-2.25 2.25h-1.5z" /></Icon>;
export const LockClosedIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></Icon>;
export const MagnifyingGlassIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></Icon>;
export const MapPinIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></Icon>;
export const MoonIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></Icon>;
export const PaperAirplaneIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></Icon>;
export const PauseIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></Icon>;
export const PencilIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></Icon>;
export const PlayIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></Icon>;
export const PlusCircleIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>;
export const QuestionMarkCircleIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></Icon>;
export const RectangleStackIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L12 15.25l5.571-3M3.429 21.75l5.571-3 5.571 3m-11.142 0L12 18.25l5.571 3" /></Icon>;
export const RocketLaunchIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a17.96 17.96 0 01-12.06 0v4.82a17.96 17.96 0 0112.06 0v-4.82zM12 2.25a21 21 0 0110.06 1.83v11.84a21 21 0 01-10.06 1.83V2.25z" /></Icon>;
export const ShieldCheckIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>;
export const ShieldExclamationIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></Icon>;
export const SparklesIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM18 15.75l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 18l-1.035.259a3.375 3.375 0 00-2.456 2.456L18 21.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 18l1.035-.259a3.375 3.375 0 002.456-2.456L18 15.75z" /></Icon>;
export const Squares2X2Icon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></Icon>;
export const StopIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" /></Icon>;
export const SunIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></Icon>;
export const TagIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.975 2.754.725l4.318-1.44a3 3 0 002.32-3.159l-1.44-4.318a2.625 2.625 0 00-.725-2.754L9.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 9h.008v.008H6V9z" /></Icon>;
export const TrashIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.576 0c.342.052.682.107 1.022.166m0 0l-2.244 2.244m-2.242-2.244l2.242 2.244" /></Icon>;
export const UserCircleIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></Icon>;
export const UsersIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.53-2.473M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.43c.317.92.482 1.907.482 2.93zM9.75 9.75c0-1.113.285-2.16.786-3.07M9.75 9.75v.106A12.318 12.318 0 002.376 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0011.964-4.43c.317.92.482 1.907.482 2.93zM21 9.75c0-1.113.285-2.16.786-3.07M21 9.75v.106A12.318 12.318 0 0013.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0011.964-4.43c.317.92.482 1.907.482 2.93z" /></Icon>;
export const ViewfinderCircleIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5v-.75a.75.75 0 01.75-.75h.75m.75 0a.75.75 0 01.75.75v.75m0 0v.75a.75.75 0 01-.75.75h-.75m-.75 0h-.75a.75.75 0 01-.75-.75v-.75m1.5 0v.75m0-1.5V10.5M3 16.5v.75a.75.75 0 00.75.75h.75m.75 0a.75.75 0 00.75-.75v-.75m0 0v-.75a.75.75 0 00-.75-.75h-.75m-.75 0h-.75a.75.75 0 00-.75.75v.75m1.5 0v-.75m0 1.5V16.5m12-6v-.75a.75.75 0 00-.75-.75h-.75m-.75 0a.75.75 0 00-.75.75v.75m0 0v.75a.75.75 0 00.75.75h.75m.75 0h.75a.75.75 0 00.75-.75v-.75m-1.5 0v.75m0-1.5V10.5m0 6v.75a.75.75 0 01-.75.75h-.75m-.75 0a.75.75 0 01-.75-.75v-.75m0 0v-.75a.75.75 0 01.75-.75h.75m.75 0h.75a.75.75 0 01.75.75v.75m-1.5 0v-.75m0 1.5V16.5m-6-1.5v-3.75a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v3.75m-4.5 0v3.75a.75.75 0 00.75.75h3a.75.75 0 00.75-.75V15.75m-4.5 0h4.5" /></Icon>;
export const XCircleIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>;
export const XMarkIcon: FC<IconProps> = (props) => <Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>;

export const HeartIcon: FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
);

export const WhatsappIcon: FC<IconProps> = (props) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52s-.67-.816-.916-.816-.371.075-.496.075-.52.249-.665.374-.52.625-.52.625.075 1.574 1.574 3.048c1.5 1.474 3.098 2.32 3.696 2.52.6.198 1.098.173 1.523-.025.426-.2 1.255-.867 1.428-1.164.173-.297.173-.546.124-.694s-.149-.249-.297-.398zM12.001 2.001a9.999 9.999 0 0 0-9.998 9.998c0 5.522 4.478 9.999 9.998 9.999a9.999 9.999 0 0 0 9.998-9.999c0-5.522-4.478-9.999-9.998-9.999zm0 18.273c-4.56 0-8.273-3.714-8.273-8.274s3.713-8.273 8.273-8.273c4.56 0 8.273 3.713 8.273 8.273s-3.713 8.274-8.273 8.274z"/>
  </svg>
);