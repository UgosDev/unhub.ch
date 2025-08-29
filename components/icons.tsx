import React, { type FC, type HTMLAttributes, type SVGProps } from 'react';

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
      <path fill={darkFill || "#9e5bfe"} d="M267.22,12.23c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.21-2.04,5.35-2.04s3.93.68,5.35,2.04c1.42,1.36,2.13,3.06,2.13,5.09s-.71,3.73-2.13,5.09c-1.42,1.36-3.21,2.05-5.35,2.05s-3.93-.68-5.35-2.05ZM278.58,20.02v48.21h-12.18V20.02h12.18Z"/>
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
  <svg id="Livello_5" data-name="Livello 5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 484.23 69.01" {...props}>
    <g>
      <path fill={darkFill || "#fe3f27"} d="M2.92,30.98c1.94-3.77,4.58-6.67,7.92-8.7,3.33-2.03,7.06-3.05,11.18-3.05,3.6,0,6.75.73,9.44,2.18,2.7,1.45,4.86,3.28,6.48,5.48v-6.88h12.27v48.21h-12.27v-7.05c-1.57,2.26-3.73,4.13-6.48,5.61-2.76,1.48-5.93,2.22-9.53,2.22-4.06,0-7.76-1.04-11.1-3.13-3.34-2.09-5.98-5.03-7.92-8.83-1.94-3.8-2.92-8.17-2.92-13.1s.97-9.2,2.92-12.97ZM36.21,36.51c-1.16-2.12-2.73-3.74-4.7-4.87-1.97-1.13-4.09-1.7-6.35-1.7s-4.35.55-6.27,1.65c-1.91,1.1-3.47,2.71-4.66,4.83s-1.78,4.63-1.78,7.53.59,5.44,1.78,7.61,2.76,3.85,4.7,5c1.94,1.16,4.02,1.74,6.22,1.74s4.38-.57,6.35-1.7c1.97-1.13,3.54-2.75,4.7-4.87,1.16-2.12,1.74-4.65,1.74-7.61s-.58-5.5-1.74-7.61Z"/>
      <path fill={darkFill || "#fe3f27"} d="M80.46,21.5c2.52-1.45,5.41-2.18,8.66-2.18v12.79h-3.22c-3.83,0-6.72.9-8.66,2.7-1.94,1.8-2.92,4.93-2.92,9.4v24.02h-12.18V20.02h12.18v7.49c1.57-2.55,3.61-4.55,6.14-6.01Z"/>
      <path fill={darkFill || "#fe3f27"} d="M97.21,31.03c2.03-3.74,4.84-6.64,8.44-8.7,3.6-2.06,7.72-3.09,12.36-3.09,5.98,0,10.92,1.49,14.84,4.48,3.92,2.99,6.54,7.18,7.88,12.58h-13.14c-.7-2.09-1.87-3.73-3.53-4.92-1.65-1.19-3.7-1.78-6.14-1.78-3.48,0-6.24,1.26-8.27,3.78s-3.04,6.11-3.04,10.75,1.01,8.14,3.04,10.66,4.79,3.78,8.27,3.78c4.93,0,8.15-2.2,9.66-6.61h13.14c-1.33,5.22-3.97,9.37-7.92,12.45-3.95,3.08-8.88,4.61-14.8,4.61-4.64,0-8.76-1.03-12.36-3.09-3.6-2.06-6.41-4.96-8.44-8.7-2.03-3.74-3.05-8.11-3.05-13.1s1.02-9.36,3.05-13.1Z"/>
      <path fill={darkFill || "#fe3f27"} d="M186.59,21.72c2.84,1.59,5.06,3.94,6.66,7.05,1.6,3.1,2.4,6.83,2.4,11.18v28.29h-12.18v-26.63c0-3.83-.96-6.77-2.87-8.83-1.91-2.06-4.52-3.09-7.83-3.09s-6.02,1.03-7.96,3.09c-1.94,2.06-2.92,5-2.92,8.83v26.63h-12.18V3.83h12.18v22.19c1.57-2.09,3.65-3.73,6.27-4.92,2.61-1.19,5.51-1.79,8.7-1.79,3.65,0,6.9.8,9.75,2.4Z"/>
      <path fill={darkFill || "#fe3f27"} d="M208.04,12.23c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.21-2.04,5.35-2.04s3.93.68,5.35,2.04c1.42,1.36,2.13,3.06,2.13,5.09s-.71,3.73-2.13,5.09c-1.42,1.36-3.21,2.05-5.35,2.05s-3.93-.68-5.35-2.05ZM219.4,20.02v48.21h-12.18V20.02h12.18Z"/>
      <path fill={darkFill || "#fe3f27"} d="M251.52,57l12.18-36.99h12.97l-17.84,48.21h-14.8l-17.75-48.21h13.06l12.18,36.99Z"/>
      <path fill={darkFill || "#fe3f27"} d="M284.37,12.23c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.21-2.04,5.35-2.04s3.93.68,5.35,2.04c1.42,1.36,2.13,3.06,2.13,5.09s-.71,3.73-2.13,5.09c-1.42,1.36-3.21,2.05-5.35,2.05s-3.93-.68-5.35-2.05ZM295.73,20.02v48.21h-12.18V20.02h12.18Z"/>
      <path fill={darkFill || "#fe3f27"} d="M316.61,65.93c-3.71-2.06-6.63-4.97-8.75-8.75-2.12-3.77-3.18-8.12-3.18-13.05s1.09-9.28,3.26-13.05c2.18-3.77,5.15-6.69,8.92-8.75,3.77-2.06,7.98-3.09,12.62-3.09s8.85,1.03,12.62,3.09c3.77,2.06,6.75,4.98,8.92,8.75,2.18,3.77,3.26,8.12,3.26,13.05s-1.12,9.28-3.35,13.05c-2.23,3.77-5.25,6.69-9.05,8.75s-8.05,3.09-12.75,3.09-8.82-1.03-12.53-3.09ZM335.37,56.79c1.94-1.07,3.49-2.68,4.65-4.83,1.16-2.14,1.74-4.76,1.74-7.83,0-4.58-1.2-8.11-3.61-10.57-2.41-2.47-5.35-3.7-8.83-3.7s-6.4,1.23-8.75,3.7c-2.35,2.47-3.52,5.99-3.52,10.57s1.14,8.11,3.44,10.57c2.29,2.47,5.18,3.7,8.66,3.7,2.21,0,4.28-.54,6.22-1.61Z"/>
    </g>
    <g>
      <path fill={lightFill || "#fc7d6e"} d="M363.22,66.79c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.23-2.04,5.44-2.04s3.92.68,5.31,2.04c1.39,1.36,2.09,3.06,2.09,5.09s-.7,3.73-2.09,5.09c-1.39,1.36-3.16,2.05-5.31,2.05s-4.02-.68-5.44-2.05Z"/>
      <path fill={lightFill || "#fc7d6e"} d="M385.8,31.03c2.03-3.74,4.84-6.64,8.44-8.7,3.6-2.06,7.72-3.09,12.36-3.09,5.98,0,10.92,1.49,14.84,4.48,3.92,2.99,6.54,7.18,7.88,12.58h-13.14c-.7-2.09-1.87-3.73-3.53-4.92-1.65-1.19-3.7-1.78-6.14-1.78-3.48,0-6.24,1.26-8.27,3.78s-3.04,6.11-3.04,10.75,1.01,8.14,3.04,10.66,4.79,3.78,8.27,3.78c4.93,0,8.15-2.2,9.66-6.61h13.14c-1.33,5.22-3.97,9.37-7.92,12.45-3.95,3.08-8.88,4.61-14.8,4.61-4.64,0-8.76-1.03-12.36-3.09-3.6-2.06-6.41-4.96-8.44-8.7s-3.05-8.11-3.05-13.1,1.02-9.36,3.05-13.1Z"/>
      <path fill={lightFill || "#fc7d6e"} d="M475.18,21.72c2.84,1.59,5.06,3.94,6.66,7.05s2.4,6.83,2.4,11.18v28.29h-12.18v-26.63c0-3.83-.96-6.77-2.87-8.83-1.91-2.06-4.52-3.09-7.83-3.09s-6.02,1.03-7.96,3.09c-1.94,2.06-2.92,5-2.92,8.83v26.63h-12.18V3.83h12.18v22.19c1.57-2.09,3.65-3.73,6.27-4.92,2.61-1.19,5.51-1.79,8.7-1.79,3.65,0,6.9.8,9.75,2.4Z"/>
    </g>
  </svg>
);

export const PolizzeChWordmarkIcon: FC<ScansioniChWordmarkIconProps> = ({ lightFill, darkFill, ...props }) => (
    <svg id="Livello_5" data-name="Livello 5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 421.66 91.21" {...props}>
    <g>
      <path fill={darkFill || "#0e7490"} d="M18.67,21.45c2.76-1.48,5.9-2.22,9.44-2.22,4.12,0,7.84,1.02,11.18,3.05,3.33,2.03,5.98,4.92,7.92,8.66,1.94,3.74,2.91,8.08,2.91,13.01s-.97,9.3-2.91,13.1c-1.94,3.8-4.59,6.74-7.92,8.83-3.34,2.09-7.06,3.13-11.18,3.13-3.54,0-6.66-.73-9.36-2.18-2.7-1.45-4.89-3.28-6.57-5.48v29.85H0V20.02h12.18v6.96c1.57-2.2,3.73-4.05,6.48-5.53ZM35.9,36.42c-1.19-2.12-2.76-3.73-4.7-4.83-1.94-1.1-4.05-1.65-6.31-1.65s-4.28.57-6.22,1.7c-1.94,1.13-3.51,2.77-4.7,4.92-1.19,2.15-1.79,4.67-1.79,7.57s.59,5.43,1.79,7.57c1.19,2.15,2.75,3.78,4.7,4.92,1.94,1.13,4.02,1.7,6.22,1.7s4.37-.58,6.31-1.74c1.94-1.16,3.51-2.81,4.7-4.96,1.19-2.14,1.79-4.7,1.79-7.66s-.6-5.41-1.79-7.53Z"/>
      <path fill={darkFill || "#0e7490"} d="M67.88,65.93c-3.71-2.06-6.63-4.97-8.75-8.75-2.12-3.77-3.18-8.12-3.18-13.05s1.09-9.28,3.26-13.05c2.18-3.77,5.15-6.69,8.92-8.75,3.77-2.06,7.98-3.09,12.62-3.09s8.85,1.03,12.62,3.09c3.77,2.06,6.75,4.98,8.92,8.75,2.18,3.77,3.26,8.12,3.26,13.05s-1.12,9.28-3.35,13.05c-2.23,3.77-5.25,6.69-9.05,8.75-3.8,2.06-8.05,3.09-12.75,3.09s-8.82-1.03-12.53-3.09ZM86.64,56.79c1.94-1.07,3.49-2.68,4.65-4.83,1.16-2.14,1.74-4.76,1.74-7.83,0-4.58-1.2-8.11-3.61-10.57-2.41-2.47-5.35-3.7-8.83-3.7s-6.4,1.23-8.75,3.7c-2.35,2.47-3.52,5.99-3.52,10.57s1.14,8.11,3.44,10.57c2.29,2.47,5.18,3.7,8.66,3.7,2.21,0,4.28-.54,6.22-1.61Z"/>
      <path fill={darkFill || "#0e7490"} d="M126.71,3.83v64.4h-12.18V3.83h12.18Z"/>
      <path fill={darkFill || "#0e7490"} d="M139.55,12.23c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.21-2.04,5.35-2.04s3.93.68,5.35,2.04c1.42,1.36,2.13,3.06,2.13,5.09s-.71,3.73-2.13,5.09c-1.42,1.36-3.21,2.05-5.35,2.05s-3.93-.68-5.35-2.05ZM150.91,20.02v48.21h-12.18V20.02h12.18Z"/>
      <path fill={darkFill || "#0e7490"} d="M174.06,58.22h21.5v10.01h-35.33v-9.83l21.06-28.37h-20.97v-10.01h34.99v9.83l-21.24,28.37Z"/>
      <path fill={darkFill || "#0e7490"} d="M216.09,58.22h21.5v10.01h-35.33v-9.83l21.06-28.37h-20.97v-10.01h34.99v9.83l-21.24,28.37Z"/>
      <path fill={darkFill || "#0e7490"} d="M291.46,47.78h-35.25c.29,3.48,1.51,6.21,3.65,8.18,2.15,1.97,4.79,2.96,7.92,2.96,4.53,0,7.75-1.94,9.66-5.83h13.14c-1.39,4.64-4.06,8.46-8.01,11.44-3.95,2.99-8.79,4.48-14.54,4.48-4.64,0-8.8-1.03-12.49-3.09-3.69-2.06-6.56-4.97-8.61-8.75-2.06-3.77-3.09-8.12-3.09-13.05s1.02-9.37,3.05-13.14c2.03-3.77,4.87-6.67,8.53-8.7,3.66-2.03,7.86-3.05,12.62-3.05s8.69.99,12.32,2.96c3.63,1.97,6.44,4.77,8.44,8.4,2,3.63,3,7.79,3,12.49,0,1.74-.12,3.31-.35,4.7ZM279.19,39.6c-.06-3.13-1.19-5.64-3.39-7.53-2.21-1.88-4.91-2.83-8.1-2.83-3.02,0-5.55.91-7.61,2.74-2.06,1.83-3.32,4.37-3.78,7.61h22.89Z"/>
    </g>
    <g>
      <path fill={lightFill || "#67e8f9"} d="M300.64,66.79c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.23-2.04,5.44-2.04s3.92.68,5.31,2.04c1.39,1.36,2.09,3.06,2.09,5.09s-.7,3.73-2.09,5.09c-1.39,1.36-3.16,2.05-5.31,2.05s-4.02-.68-5.44-2.05Z"/>
      <path fill={lightFill || "#67e8f9"} d="M323.22,31.03c2.03-3.74,4.84-6.64,8.44-8.7,3.6-2.06,7.72-3.09,12.36-3.09,5.98,0,10.92,1.49,14.84,4.48,3.92,2.99,6.54,7.18,7.88,12.58h-13.14c-.7-2.09-1.87-3.73-3.53-4.92-1.65-1.19-3.7-1.78-6.14-1.78-3.48,0-6.24,1.26-8.27,3.78s-3.04,6.11-3.04,10.75,1.01,8.14,3.04,10.66c2.03,2.52,4.79,3.78,8.27,3.78,4.93,0,8.15-2.2,9.66-6.61h13.14c-1.33,5.22-3.97,9.37-7.92,12.45-3.95,3.08-8.88,4.61-14.8,4.61-4.64,0-8.76-1.03-12.36-3.09-3.6-2.06-6.41-4.96-8.44-8.7s-3.05-8.11-3.05-13.1,1.02-9.36,3.05-13.1Z"/>
      <path fill={lightFill || "#67e8f9"} d="M412.6,21.72c2.84,1.59,5.06,3.94,6.66,7.05,1.6,3.1,2.4,6.83,2.4,11.18v28.29h-12.18v-26.63c0-3.83-.96-6.77-2.87-8.83-1.91-2.06-4.52-3.09-7.83-3.09s-6.02,1.03-7.96,3.09c-1.94,2.06-2.92,5-2.92,8.83v26.63h-12.18V3.83h12.18v22.19c1.57-2.09,3.65-3.73,6.27-4.92,2.61-1.19,5.51-1.79,8.7-1.79,3.65,0,6.9.8,9.75,2.4Z"/>
    </g>
  </svg>
);

export const DisdetteChWordmarkIcon: FC<ScansioniChWordmarkIconProps> = ({ lightFill, darkFill, ...props }) => (
  <svg id="Livello_5" data-name="Livello 5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488.67 69.01" {...props}>
    <g>
      <path fill={darkFill || "#6afc61"} d="M2.92,30.98c1.94-3.77,4.6-6.67,7.96-8.7,3.37-2.03,7.11-3.05,11.23-3.05,3.13,0,6.12.68,8.97,2.04,2.84,1.36,5.1,3.18,6.79,5.44V3.83h12.36v64.4h-12.36v-7.14c-1.51,2.38-3.63,4.29-6.35,5.74s-5.89,2.18-9.49,2.18c-4.06,0-7.77-1.04-11.14-3.13-3.36-2.09-6.02-5.03-7.96-8.83-1.94-3.8-2.92-8.17-2.92-13.1s.97-9.2,2.92-12.97ZM36.21,36.51c-1.16-2.12-2.73-3.74-4.7-4.87-1.97-1.13-4.09-1.7-6.35-1.7s-4.35.55-6.27,1.65c-1.91,1.1-3.47,2.71-4.66,4.83-1.19,2.12-1.78,4.63-1.78,7.53s.59,5.44,1.78,7.61c1.19,2.18,2.76,3.85,4.7,5,1.94,1.16,4.02,1.74,6.22,1.74s4.38-.57,6.35-1.7c1.97-1.13,3.54-2.75,4.7-4.87,1.16-2.12,1.74-4.65,1.74-7.61s-.58-5.5-1.74-7.61Z"/>
      <path fill={darkFill || "#6afc61"} d="M62.96,12.23c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.21-2.04,5.35-2.04s3.93.68,5.35,2.04c1.42,1.36,2.13,3.06,2.13,5.09s-.71,3.73-2.13,5.09c-1.42,1.36-3.21,2.05-5.35,2.05s-3.93-.68-5.35-2.05ZM74.32,20.02v48.21h-12.18V20.02h12.18Z"/>
      <path fill={darkFill || "#6afc61"} d="M94.17,66.88c-3.13-1.42-5.61-3.35-7.44-5.79s-2.83-5.14-3-8.1h12.27c.23,1.86,1.14,3.39,2.74,4.61,1.6,1.22,3.58,1.83,5.96,1.83s4.13-.46,5.44-1.39c1.3-.93,1.96-2.12,1.96-3.57,0-1.57-.8-2.74-2.4-3.53-1.59-.78-4.13-1.64-7.61-2.57-3.6-.87-6.54-1.77-8.83-2.7-2.29-.93-4.26-2.35-5.92-4.27-1.65-1.91-2.48-4.49-2.48-7.75,0-2.67.77-5.1,2.31-7.31,1.54-2.2,3.74-3.94,6.61-5.22,2.87-1.27,6.25-1.91,10.14-1.91,5.75,0,10.33,1.44,13.75,4.31,3.42,2.87,5.31,6.75,5.66,11.62h-11.66c-.18-1.91-.97-3.44-2.4-4.57-1.42-1.13-3.32-1.7-5.7-1.7-2.2,0-3.9.41-5.09,1.22-1.19.81-1.78,1.94-1.78,3.39,0,1.63.81,2.86,2.44,3.7,1.62.84,4.15,1.7,7.57,2.57,3.48.87,6.36,1.77,8.62,2.7,2.26.93,4.22,2.37,5.87,4.31,1.65,1.94,2.51,4.51,2.57,7.7,0,2.79-.77,5.28-2.31,7.48-1.54,2.21-3.74,3.93-6.61,5.18-2.87,1.25-6.22,1.87-10.05,1.87s-7.48-.71-10.62-2.13Z"/>
      <path fill={darkFill || "#6afc61"} d="M133.55,30.98c1.94-3.77,4.6-6.67,7.96-8.7,3.37-2.03,7.11-3.05,11.23-3.05,3.13,0,6.12.68,8.97,2.04,2.84,1.36,5.1,3.18,6.79,5.44V3.83h12.36v64.4h-12.36v-7.14c-1.51,2.38-3.63,4.29-6.35,5.74s-5.89,2.18-9.49,2.18c-4.06,0-7.77-1.04-11.14-3.13-3.36-2.09-6.02-5.03-7.96-8.83-1.94-3.8-2.92-8.17-2.92-13.1s.97-9.2,2.92-12.97ZM166.84,36.51c-1.16-2.12-2.73-3.74-4.7-4.87-1.97-1.13-4.09-1.7-6.35-1.7s-4.35.55-6.27,1.65c-1.91,1.1-3.47,2.71-4.66,4.83-1.19,2.12-1.78,4.63-1.78,7.53s.59,5.44,1.78,7.61c1.19,2.18,2.76,3.85,4.7,5,1.94,1.16,4.02,1.74,6.22,1.74s4.38-.57,6.35-1.7c1.97-1.13,3.54-2.75,4.7-4.87,1.16-2.12,1.74-4.65,1.74-7.61s-.58-5.5-1.74-7.61Z"/>
      <path fill={darkFill || "#6afc61"} d="M237.24,47.78h-35.25c.29,3.48,1.51,6.21,3.65,8.18,2.15,1.97,4.79,2.96,7.92,2.96,4.53,0,7.75-1.94,9.66-5.83h13.14c-1.39,4.64-4.06,8.46-8.01,11.44-3.95,2.99-8.79,4.48-14.54,4.48-4.64,0-8.8-1.03-12.49-3.09-3.69-2.06-6.56-4.97-8.61-8.75-2.06-3.77-3.09-8.12-3.09-13.05s1.02-9.37,3.05-13.14c2.03-3.77,4.87-6.67,8.53-8.7,3.66-2.03,7.86-3.05,12.62-3.05s8.69.99,12.32,2.96c3.63,1.97,6.44,4.77,8.44,8.4,2,3.63,3,7.79,3,12.49,0,1.74-.12,3.31-.35,4.7ZM224.97,39.6c-.06-3.13-1.19-5.64-3.39-7.53-2.21-1.88-4.91-2.83-8.1-2.83-3.02,0-5.55.91-7.61,2.74s-3.32,4.37-3.78,7.61h22.89Z"/>
      <path fill={darkFill || "#6afc61"} d="M260.65,30.03v23.32c0,1.63.39,2.8,1.18,3.53.78.73,2.1,1.09,3.96,1.09h5.66v10.27h-7.66c-10.27,0-15.4-4.99-15.4-14.97v-23.24h-5.75v-10.01h5.75v-11.92h12.27v11.92h10.79v10.01h-10.79Z"/>
      <path fill={darkFill || "#6afc61"} d="M294.42,30.03v23.32c0,1.63.39,2.8,1.18,3.53.78.73,2.1,1.09,3.96,1.09h5.66v10.27h-7.66c-10.27,0-15.4-4.99-15.4-14.97v-23.24h-5.75v-10.01h5.75v-11.92h12.27v11.92h10.79v10.01h-10.79Z"/>
      <path fill={darkFill || "#6afc61"} d="M358.47,47.78h-35.25c.29,3.48,1.51,6.21,3.65,8.18,2.15,1.97,4.79,2.96,7.92,2.96,4.53,0,7.75-1.94,9.66-5.83h13.14c-1.39,4.64-4.06,8.46-8.01,11.44-3.95,2.99-8.79,4.48-14.54,4.48-4.64,0-8.8-1.03-12.49-3.09-3.69-2.06-6.56-4.97-8.61-8.75-2.06-3.77-3.09-8.12-3.09-13.05s1.02-9.37,3.05-13.14c2.03-3.77,4.87-6.67,8.53-8.7,3.66-2.03,7.86-3.05,12.62-3.05s8.69.99,12.32,2.96c3.63,1.97,6.44,4.77,8.44,8.4s3,7.79,3,12.49c0,1.74-.12,3.31-.35,4.7ZM346.2,39.6c-.06-3.13-1.19-5.64-3.39-7.53-2.21-1.88-4.91-2.83-8.1-2.83-3.02,0-5.55.91-7.61,2.74-2.06,1.83-3.32,4.37-3.78,7.61h22.89Z"/>
    </g>
    <g>
      <path fill={lightFill || "#b7fab2"} d="M367.65,66.79c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.23-2.04,5.44-2.04s3.92.68,5.31,2.04c1.39,1.36,2.09,3.06,2.09,5.09s-.7,3.73-2.09,5.09c-1.39,1.36-3.16,2.05-5.31,2.05s-4.02-.68-5.44-2.05Z"/>
      <path fill={lightFill || "#b7fab2"} d="M390.24,31.03c2.03-3.74,4.84-6.64,8.44-8.7,3.6-2.06,7.72-3.09,12.36-3.09,5.98,0,10.92,1.49,14.84,4.48,3.92,2.99,6.54,7.18,7.88,12.58h-13.14c-.7-2.09-1.87-3.73-3.53-4.92-1.65-1.19-3.7-1.78-6.14-1.78-3.48,0-6.24,1.26-8.27,3.78s-3.04,6.11-3.04,10.75,1.01,8.14,3.04,10.66,4.79,3.78,8.27,3.78c4.93,0,8.15-2.2,9.66-6.61h13.14c-1.33,5.22-3.97,9.37-7.92,12.45-3.95,3.08-8.88,4.61-14.8,4.61-4.64,0-8.76-1.03-12.36-3.09-3.6-2.06-6.41-4.96-8.44-8.7-2.03-3.74-3.05-8.11-3.05-13.1s1.02-9.36,3.05-13.1Z"/>
      <path fill={lightFill || "#b7fab2"} d="M479.62,21.72c2.84,1.59,5.06,3.94,6.66,7.05,1.6,3.1,2.4,6.83,2.4,11.18v28.29h-12.18v-26.63c0-3.83-.96-6.77-2.87-8.83-1.91-2.06-4.52-3.09-7.83-3.09s-6.02,1.03-7.96,3.09c-1.94,2.06-2.92,5-2.92,8.83v26.63h-12.18V3.83h12.18v22.19c1.57-2.09,3.65-3.73,6.27-4.92,2.61-1.19,5.51-1.79,8.7-1.79,3.65,0,6.9.8,9.75,2.4Z"/>
    </g>
  </svg>
);

export const UnHubChWordmarkIcon: FC<ScansioniChWordmarkIconProps> = ({ lightFill, darkFill, ...props }) => (
  <svg viewBox="0 0 420 70" {...props}>
    <text {...textSvgProps} x="0" fill={darkFill || "#ffffff"}>UnHub</text>
    <text {...textSvgProps} x="230" fill={lightFill || "#c6a1fc"}>.ch</text>
  </svg>
);

// --- GENERIC ICONS ---
interface IconProps extends HTMLAttributes<HTMLSpanElement> {
    title?: string;
}

export const ArrowDownIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>arrow_downward</span>;
export const ArrowPathIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>sync</span>;
export const ArrowsPointingOutIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>open_in_full</span>;
export const ArrowsRightLeftIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>swap_horiz</span>;
export const ArrowUpIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>arrow_upward</span>;
export const ArrowUturnLeftIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>undo</span>;
export const ArrowUturnRightIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>redo</span>;
export const Bars3Icon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>menu</span>;
export const BoltIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>bolt</span>;
export const BoltSlashIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>flash_off</span>;
export const BoltAutoIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>flash_auto</span>;
export const BookOpenIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>menu_book</span>;
export const BuildingOffice2Icon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>corporate_fare</span>;
export const CameraIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>photo_camera</span>;
export const ChatBubbleLeftRightIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>chat</span>;
export const CheckCircleIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>check_circle</span>;
export const CheckIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>check</span>;
export const ChevronDownIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>expand_more</span>;
export const ChevronRightIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>chevron_right</span>;
export const ChevronUpIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>expand_less</span>;
export const ClipboardDocumentCheckIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>assignment_turned_in</span>;
export const ClipboardDocumentIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>assignment</span>;
export const ClockIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>schedule</span>;
export const CogIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>settings</span>;
export const CoinIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>monetization_on</span>;
export const ComputerDesktopIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>desktop_windows</span>;
export const CreditCardIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>credit_card</span>;
export const DocumentDuplicateIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>file_copy</span>;
export const DocumentPlusIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>note_add</span>;
export const DocumentTextIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>article</span>;
export const DownloadIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>download</span>;
export const EllipsisVerticalIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>more_vert</span>;
export const EnvelopeIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>email</span>;
export const EyeIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>visibility</span>;
export const FastForwardIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>fast_forward</span>;
export const FileIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>draft</span>;
export const FolderIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>folder</span>;
export const FolderPlusIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>create_new_folder</span>;
export const GoogleIcon: FC<SVGProps<SVGSVGElement>> = (props) => <svg viewBox="0 0 48 48" {...props}><path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" /></svg>;
export const HandThumbDownIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>thumb_down</span>;
export const HandThumbUpIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>thumb_up</span>;
export const InformationCircleIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>info</span>;
export const LayersIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>layers</span>;
export const LightBulbIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>lightbulb</span>;
export const LockClosedIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>lock</span>;
export const MagnifyingGlassIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>search</span>;
export const MapPinIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>place</span>;
export const MoonIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>dark_mode</span>;
export const PaperAirplaneIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>send</span>;
export const PauseIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>pause</span>;
export const PencilIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>edit</span>;
export const PlayIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>play_arrow</span>;
export const PlusCircleIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>add_circle</span>;
export const QuestionMarkCircleIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>help_outline</span>;
export const RectangleStackIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>stacks</span>;
export const RocketLaunchIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>rocket_launch</span>;
export const ShieldCheckIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>verified_user</span>;
export const ShieldExclamationIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>gpp_bad</span>;
export const SparklesIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>auto_awesome</span>;
export const Squares2X2Icon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>apps</span>;
export const StopIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>stop</span>;
export const SunIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>light_mode</span>;
export const TagIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>label</span>;
export const TrashIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>delete</span>;
export const UserCircleIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>account_circle</span>;
export const UsersIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>group</span>;
export const ViewfinderCircleIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>center_focus_strong</span>;
export const XCircleIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>cancel</span>;
export const XMarkIcon: FC<IconProps> = (props) => <span {...props} className={`material-symbols-outlined ${props.className || ''}`}>close</span>;

export const HeartIcon: FC<IconProps & { fill?: string }> = (props) => {
    const { fill, style, className, ...rest } = props;
    const newStyle: React.CSSProperties = {
        ...style,
        fontVariationSettings: `'FILL' ${fill !== 'none' ? 1 : 0}`,
    };
    return <span {...rest} style={newStyle} className={`material-symbols-outlined ${className || ''}`}>favorite</span>
};

export const WhatsappIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52s-.67-.816-.916-.816-.371.075-.496.075-.52.249-.665.374-.52.625-.52.625.075 1.574 1.574 3.048c1.5 1.474 3.098 2.32 3.696 2.52.6.198 1.098.173 1.523-.025.426-.2 1.255-.867 1.428-1.164.173-.297.173-.546.124-.694s-.149-.249-.297-.398zM12.001 2.001a9.999 9.999 0 0 0-9.998 9.998c0 5.522 4.478 9.999 9.998 9.999a9.999 9.999 0 0 0 9.998-9.999c0-5.522-4.478-9.999-9.998-9.999zm0 18.273c-4.56 0-8.273-3.714-8.273-8.274s3.713-8.273 8.273-8.273c4.56 0 8.273 3.713 8.273 8.273s-3.713 8.274-8.273 8.274z"/>
  </svg>
);