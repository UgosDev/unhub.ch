import React, { type FC, type ReactNode, type SVGProps, type HTMLAttributes } from 'react';

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
      <path fill={darkFill || "#9e5bfe"} d="M404.47,12.23c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.21-2.04,5.35-2.04s3.93.68,5.35,2.04c1.42,1.36,2.13,3.06,2.13,5.09s-.71,3.73-2.13,5.09c-1.42,1.36-3.21-2.05-5.35-2.05s-3.93-.68-5.35-2.05ZM415.82,20.02v48.21h-12.18V20.02h12.18Z"/>
    </g>
    <g>
      <path fill={lightFill || "#c6a1fc"} d="M427.79,66.79c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.23-2.04,5.44-2.04s3.92.68,5.31,2.04c1.39,1.36,2.09,3.06,2.09,5.09s-.7,3.73-2.09,5.09c-1.39,1.36-3.16,2.05-5.31,2.05s-4.02-.68-5.44-2.05Z"/>
      <path fill={lightFill || "#c6a1fc"} d="M450.38,31.03c2.03-3.74,4.84-6.64,8.44-8.7,3.6-2.06,7.72-3.09,12.36-3.09,5.98,0,10.92,1.49,14.84,4.48,3.92,2.99,6.54,7.18,7.88,12.58h-13.14c-.7-2.09-1.87-3.73-3.53-4.92-1.65-1.19-3.7-1.78-6.14-1.78-3.48,0-6.24,1.26-8.27,3.78-2.03,2.52-3.04,6.11-3.04,10.75s1.01,8.14,3.04,10.66,4.79,3.78,8.27,3.78c4.93,0,8.15-2.2,9.66-6.61h13.14c-1.33,5.22-3.97,9.37-7.92,12.45-3.95,3.08-8.88,4.61-14.8,4.61-4.64,0-8.76-1.03-12.36-3.09-3.6-2.06-6.41-4.96-8.44-8.7-2.03,3.74-3.05-8.11-3.05-13.1s1.02-9.36,3.05-13.1Z"/>
      <path fill={lightFill || "#c6a1fc"} d="M539.75,21.72c2.84,1.59,5.06,3.94,6.66,7.05,1.6,3.1,2.4,6.83,2.4,11.18v28.29h-12.18v-26.63c0-3.83-.96-6.77-2.87-8.83-1.91-2.06-4.52-3.09-7.83-3.09s-6.02,1.03-7.96,3.09c-1.94,2.06-2.92,5-2.92,8.83v26.63h-12.18V3.83h12.18v22.19c1.57-2.09,3.65-3.73,6.27-4.92,2.61-1.19,5.51-1.79,8.7-1.79,3.65,0,6.9.8,9.75,2.4Z"/>
    </g>
  </svg>
);


export const ArchivioChLogoIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg id="Livello_5" data-name="Livello 5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1034.12 768.26" {...props}>
    <polygon fill="#fc7d6e" points="738.49 .08 442.82 .08 590.66 256.07 590.62 256.07 590.62 256.11 590.66 256.14 886.32 768.26 886.35 768.19 886.32 768.19 1034.12 512.2 1034.12 512.17 886.32 256.14 738.49 .08"/>
    <polygon fill="#fe3f27" points="442.78 0 294.95 256.06 147.11 512.12 147.49 512.73 0 768.18 294.95 768.18 442.78 512.12 590.61 256.09 590.61 256.06 442.78 .07 442.81 .07 442.78 0"/>
  </svg>
);

export const ArchivioChWordmarkIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg id="Livello_5_Wordmark_Archivio" data-name="Livello 5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 484.23 69.01" {...props}>
    <g>
        <path fill="#fe3f27" d="M2.92,30.98c1.94-3.77,4.58-6.67,7.92-8.7,3.33-2.03,7.06-3.05,11.18-3.05,3.6,0,6.75.73,9.44,2.18,2.7,1.45,4.86,3.28,6.48,5.48v-6.88h12.27v48.21h-12.27v-7.05c-1.57,2.26-3.73,4.13-6.48,5.61-2.76,1.48-5.93,2.22-9.53,2.22-4.06,0-7.76-1.04-11.1-3.13-3.34-2.09-5.98-5.03-7.92-8.83-1.94-3.8-2.92-8.17-2.92-13.1s.97-9.2,2.92-12.97ZM36.21,36.51c-1.16-2.12-2.73-3.74-4.7-4.87-1.97-1.13-4.09-1.7-6.35-1.7s-4.35.55-6.27,1.65c-1.91,1.1-3.47,2.71-4.66,4.83s-1.78,4.63-1.78,7.53.59,5.44,1.78,7.61c1.19,2.18,2.76,3.85,4.7,5,1.94,1.16,4.02,1.74,6.22,1.74s4.38-.57,6.35-1.7c1.97-1.13,3.54-2.75,4.7-4.87,1.16-2.12,1.74-4.65,1.74-7.61s-.58-5.5-1.74-7.61Z"/>
        <path fill="#fe3f27" d="M80.46,21.5c2.52-1.45,5.41-2.18,8.66-2.18v12.79h-3.22c-3.83,0-6.72.9-8.66,2.7-1.94,1.8-2.92,4.93-2.92,9.4v24.02h-12.18V20.02h12.18v7.49c1.57-2.55,3.61-4.55,6.14-6.01Z"/>
        <path fill="#fe3f27" d="M97.21,31.03c2.03-3.74,4.84-6.64,8.44-8.7,3.6-2.06,7.72-3.09,12.36-3.09,5.98,0,10.92,1.49,14.84,4.48,3.92,2.99,6.54,7.18,7.88,12.58h-13.14c-.7-2.09-1.87-3.73-3.53-4.92-1.65-1.19-3.7-1.78-6.14-1.78-3.48,0-6.24,1.26-8.27,3.78-2.03,2.52-3.04,6.11-3.04,10.75s1.01,8.14,3.04,10.66,4.79,3.78,8.27,3.78c4.93,0,8.15-2.2,9.66-6.61h13.14c-1.33,5.22-3.97,9.37-7.92,12.45-3.95,3.08-8.88,4.61-14.8,4.61-4.64,0-8.76-1.03-12.36-3.09-3.6-2.06-6.41-4.96-8.44-8.7s-3.05-8.11-3.05-13.1,1.02-9.36,3.05-13.1Z"/>
        <path fill="#fe3f27" d="M186.59,21.72c2.84,1.59,5.06,3.94,6.66,7.05s2.4,6.83,2.4,11.18v28.29h-12.18v-26.63c0-3.83-.96-6.77-2.87-8.83-1.91-2.06-4.52-3.09-7.83-3.09s-6.02,1.03-7.96,3.09c-1.94,2.06-2.92,5-2.92,8.83v26.63h-12.18V3.83h12.18v22.19c1.57-2.09,3.65-3.73,6.27-4.92,2.61-1.19,5.51-1.79,8.7-1.79,3.65,0,6.9.8,9.75,2.4Z"/>
        <path fill="#fe3f27" d="M208.04,12.23c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.21-2.04,5.35-2.04s3.93.68,5.35,2.04c1.42,1.36,2.13,3.06,2.13,5.09s-.71,3.73-2.13,5.09c-1.42,1.36-3.21-2.05-5.35-2.05s-3.93-.68-5.35-2.05ZM219.4,20.02v48.21h-12.18V20.02h12.18Z"/>
        <path fill="#fe3f27" d="M251.52,57l12.18-36.99h12.97l-17.84,48.21h-14.8l-17.75-48.21h13.06l12.18,36.99Z"/>
        <path fill="#fe3f27" d="M284.37,12.23c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.21-2.04,5.35-2.04s3.93.68,5.35,2.04c1.42,1.36,2.13,3.06,2.13,5.09s-.71,3.73-2.13,5.09c-1.42,1.36-3.21-2.05-5.35-2.05s-3.93-.68-5.35-2.05ZM295.73,20.02v48.21h-12.18V20.02h12.18Z"/>
        <path fill="#fe3f27" d="M316.61,65.93c-3.71-2.06-6.63-4.97-8.75-8.75-2.12-3.77-3.18-8.12-3.18-13.05s1.09-9.28,3.26-13.05c2.18-3.77,5.15-6.69,8.92-8.75,3.77-2.06,7.98-3.09,12.62-3.09s8.85,1.03,12.62,3.09c3.77,2.06,6.75,4.98,8.92,8.75,2.18,3.77,3.26,8.12,3.26,13.05s-1.12,9.28-3.35,13.05c-2.23,3.77-5.25,6.69-9.05,8.75s-8.05,3.09-12.75,3.09-8.82-1.03-12.53-3.09ZM335.37,56.79c1.94-1.07,3.49-2.68,4.65-4.83,1.16-2.14,1.74-4.76,1.74-7.83,0-4.58-1.2-8.11-3.61-10.57-2.41-2.47-5.35-3.7-8.83-3.7s-6.4,1.23-8.75,3.7c-2.35,2.47-3.52,5.99-3.52,10.57s1.14,8.11,3.44,10.57c2.29,2.47,5.18,3.7,8.66,3.7,2.21,0,4.28-.54,6.22-1.61Z"/>
    </g>
    <g>
        <path fill="#fc7d6e" d="M363.22,66.79c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.23-2.04,5.44-2.04s3.92.68,5.31,2.04c1.39,1.36,2.09,3.06,2.09,5.09s-.7,3.73-2.09,5.09c-1.39,1.36-3.16,2.05-5.31,2.05s-4.02-.68-5.44-2.05Z"/>
        <path fill="#fc7d6e" d="M385.8,31.03c2.03-3.74,4.84-6.64,8.44-8.7,3.6-2.06,7.72-3.09,12.36-3.09,5.98,0,10.92,1.49,14.84,4.48,3.92,2.99,6.54,7.18,7.88,12.58h-13.14c-.7-2.09-1.87-3.73-3.53-4.92-1.65-1.19-3.7-1.78-6.14-1.78-3.48,0-6.24,1.26-8.27,3.78s-3.04,6.11-3.04,10.75,1.01,8.14,3.04,10.66,4.79,3.78,8.27,3.78c4.93,0,8.15-2.2,9.66-6.61h13.14c-1.33,5.22-3.97,9.37-7.92,12.45-3.95,3.08-8.88,4.61-14.8,4.61-4.64,0-8.76-1.03-12.36-3.09-3.6-2.06-6.41-4.96-8.44-8.7s-3.05-8.11-3.05-13.1,1.02-9.36,3.05-13.1Z"/>
        <path fill="#fc7d6e" d="M475.18,21.72c2.84,1.59,5.06,3.94,6.66,7.05s2.4,6.83,2.4,11.18v28.29h-12.18v-26.63c0-3.83-.96-6.77-2.87-8.83-1.91-2.06-4.52-3.09-7.83-3.09s-6.02,1.03-7.96,3.09c-1.94,2.06-2.92,5-2.92,8.83v26.63h-12.18V3.83h12.18v22.19c1.57-2.09,3.65-3.73,6.27-4.92,2.61-1.19,5.51-1.79,8.7-1.79,3.65,0,6.9.8,9.75,2.4Z"/>
    </g>
  </svg>
);


export const PolizzeChLogoIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg id="Livello_5" data-name="Livello 5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768.18 1478.31" {...props}>
    <polygon fill="#61f5fe" points="768.18 443.49 768.18 739.16 256.06 443.49 .03 295.66 .03 0 256.06 147.83 256.09 147.83 512.12 295.66 768.18 443.49"/>
    <polygon fill="#c0fbfc" points="768.18 739.16 512.12 886.99 256.06 1034.82 0 1182.69 0 1182.65 256.06 739.16 512.12 591.33 768.18 739.16"/>
    <polygon fill="#61f5fe" points="256.06 1034.82 256.06 1478.31 0 1478.31 0 1182.69 256.06 1034.82"/>
  </svg>
);

export const PolizzeChWordmarkIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg id="Livello_5_Wordmark_Polizze" data-name="Livello 5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 421.66 91.21" {...props}>
      <g>
        <path fill="#61f5fe" d="M18.67,21.45c2.76-1.48,5.9-2.22,9.44-2.22,4.12,0,7.84,1.02,11.18,3.05,3.33,2.03,5.98,4.92,7.92,8.66,1.94,3.74,2.91,8.08,2.91,13.01s-.97,9.3-2.91,13.1c-1.94,3.8-4.59,6.74-7.92,8.83-3.34-2.09-7.06,3.13-11.18,3.13-3.54,0-6.66-.73-9.36-2.18-2.7-1.45-4.89-3.28-6.57-5.48v29.85H0V20.02h12.18v6.96c1.57-2.2,3.73-4.05,6.48-5.53ZM35.9,36.42c-1.19-2.12-2.76-3.73-4.7-4.83-1.94-1.1-4.05-1.65-6.31-1.65s-4.28.57-6.22,1.7c-1.94,1.13-3.51,2.77-4.7,4.92-1.19,2.15-1.79,4.67-1.79,7.57s.59,5.43,1.79,7.57c1.19,2.15,2.75,3.78,4.7,4.92,1.94,1.13,4.02,1.7,6.22,1.7s4.37-.58,6.31-1.74c1.94-1.16,3.51-2.81,4.7-4.96,1.19-2.14,1.79-4.7,1.79-7.66s-.6-5.41-1.79-7.53Z"/>
        <path fill="#61f5fe" d="M67.88,65.93c-3.71-2.06-6.63-4.97-8.75-8.75-2.12-3.77-3.18-8.12-3.18-13.05s1.09-9.28,3.26-13.05c2.18-3.77,5.15-6.69,8.92-8.75,3.77-2.06,7.98-3.09,12.62-3.09s8.85,1.03,12.62,3.09c3.77,2.06,6.75,4.98,8.92,8.75,2.18,3.77,3.26,8.12,3.26,13.05s-1.12,9.28-3.35,13.05c-2.23,3.77-5.25,6.69-9.05,8.75-3.8,2.06-8.05,3.09-12.75,3.09s-8.82-1.03-12.53-3.09ZM86.64,56.79c1.94-1.07,3.49-2.68,4.65-4.83,1.16-2.14,1.74-4.76,1.74-7.83,0-4.58-1.2-8.11-3.61-10.57-2.41-2.47-5.35-3.7-8.83-3.7s-6.4,1.23-8.75,3.7c-2.35,2.47-3.52,5.99-3.52,10.57s1.14,8.11,3.44,10.57c2.29,2.47,5.18,3.7,8.66,3.7,2.21,0,4.28-.54,6.22-1.61Z"/>
        <path fill="#61f5fe" d="M126.71,3.83v64.4h-12.18V3.83h12.18Z"/>
        <path fill="#61f5fe" d="M139.55,12.23c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.21-2.04,5.35-2.04s3.93.68,5.35,2.04c1.42,1.36,2.13,3.06,2.13,5.09s-.71,3.73-2.13,5.09c-1.42,1.36-3.21-2.05-5.35-2.05s-3.93-.68-5.35-2.05ZM150.91,20.02v48.21h-12.18V20.02h12.18Z"/>
        <path fill="#61f5fe" d="M174.06,58.22h21.5v10.01h-35.33v-9.83l21.06-28.37h-20.97v-10.01h34.99v9.83l-21.24,28.37Z"/>
        <path fill="#61f5fe" d="M216.09,58.22h21.5v10.01h-35.33v-9.83l21.06-28.37h-20.97v-10.01h34.99v9.83l-21.24,28.37Z"/>
        <path fill="#61f5fe" d="M291.46,47.78h-35.25c.29,3.48,1.51,6.21,3.65,8.18,2.15,1.97,4.79,2.96,7.92,2.96,4.53,0,7.75-1.94,9.66-5.83h13.14c-1.39,4.64-4.06,8.46-8.01,11.44-3.95,2.99-8.79,4.48-14.54,4.48-4.64,0-8.8-1.03-12.49-3.09-3.69-2.06-6.56-4.97-8.61-8.75-2.06-3.77-3.09-8.12-3.09-13.05s1.02-9.37,3.05-13.14c2.03-3.77,4.87-6.67,8.53-8.7,3.66-2.03,7.86-3.05,12.62-3.05s8.69.99,12.32,2.96c3.63,1.97,6.44,4.77,8.44,8.4,2,3.63,3,7.79,3,12.49,0,1.74-.12,3.31-.35,4.7ZM279.19,39.6c-.06-3.13-1.19-5.64-3.39-7.53-2.21-1.88-4.91-2.83-8.1-2.83-3.02,0-5.55.91-7.61,2.74-2.06,1.83-3.32,4.37-3.78,7.61h22.89Z"/>
      </g>
      <g>
        <path fill="#c0fbfc" d="M300.64,66.79c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.23-2.04,5.44-2.04s3.92.68,5.31,2.04c1.39,1.36,2.09,3.06,2.09,5.09s-.7,3.73-2.09,5.09c-1.39,1.36-3.16,2.05-5.31,2.05s-4.02-.68-5.44-2.05Z"/>
        <path fill="#c0fbfc" d="M323.22,31.03c2.03-3.74,4.84-6.64,8.44-8.7,3.6-2.06,7.72-3.09,12.36-3.09,5.98,0,10.92,1.49,14.84,4.48,3.92,2.99,6.54,7.18,7.88,12.58h-13.14c-.7-2.09-1.87-3.73-3.53-4.92-1.65-1.19-3.7-1.78-6.14-1.78-3.48,0-6.24,1.26-8.27,3.78s-3.04,6.11-3.04,10.75,1.01,8.14,3.04,10.66c2.03,2.52,4.79,3.78,8.27,3.78,4.93,0,8.15-2.2,9.66-6.61h13.14c-1.33,5.22-3.97,9.37-7.92,12.45-3.95,3.08-8.88,4.61-14.8,4.61-4.64,0-8.76-1.03-12.36-3.09-3.6-2.06-6.41-4.96-8.44-8.7s-3.05-8.11-3.05-13.1,1.02-9.36,3.05-13.1Z"/>
        <path fill="#c0fbfc" d="M412.6,21.72c2.84,1.59,5.06,3.94,6.66,7.05,1.6,3.1,2.4,6.83,2.4,11.18v28.29h-12.18v-26.63c0-3.83-.96-6.77-2.87-8.83-1.91-2.06-4.52-3.09-7.83-3.09s-6.02,1.03-7.96,3.09c-1.94,2.06-2.92,5-2.92,8.83v26.63h-12.18V3.83h12.18v22.19c1.57-2.09,3.65-3.73,6.27-4.92,2.61-1.19,5.51-1.79,8.7-1.79,3.65,0,6.9.8,9.75,2.4Z"/>
      </g>
  </svg>
);

export const DisdetteChLogoIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg id="Livello_5" data-name="Livello 5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" {...props}>
    <polygon fill="#86efac" points="100,500 250,350 450,550 300,700" />
    <polygon fill="#15803d" points="300,700 450,550 900,100 750,250" />
  </svg>
);

export const DisdetteChWordmarkIcon: FC<ScansioniChWordmarkIconProps> = ({ lightFill, darkFill, ...props }) => (
  <svg
    id="Livello_5_Wordmark_Disdette"
    data-name="Livello 5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 480 70"
    {...props}
  >
    <g fill={darkFill || "#15803d"}>
        <text x="0" y="55" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="55" fontWeight="bold">Disdette</text>
    </g>
    <g fill={lightFill || "#86efac"}>
        <text x="325" y="55" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="55" fontWeight="bold">.ch</text>
    </g>
  </svg>
);


export const UssoIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12 2.25C12 2.25 5.25 4.5 5.25 9.75V15.75L12 21.75L18.75 15.75V9.75C18.75 4.5 12 2.25 12 2.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="9.5" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 11.5V15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10.5 15.5H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const GoogleIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.565-3.343-11.114-7.943l-6.571,4.819C9.656,39.663,16.318,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.904,36.218,44,30.668,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

export const UnHubChWordmarkIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 300 70" xmlns="http://www.w3.org/2000/svg" {...props}>
      <text x="0" y="55" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="60" fontWeight="bold" fill="currentColor">
        UnHub
        <tspan fill="#a855f7">.ch</tspan>
      </text>
    </svg>
);


// --- Google Material Symbols (replaces HeroIcons) ---

const IconWrapper: FC<{ children: ReactNode } & HTMLAttributes<HTMLSpanElement>> = ({ children, className, ...props }) => {
    const iconName = children as string;
    return (
        <span className={`material-symbols-outlined ${className || ''}`} {...props} aria-hidden="true">
            {iconName}
        </span>
    );
};

export const ArrowDownIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>arrow_downward</IconWrapper>);
export const ArrowPathIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>sync</IconWrapper>);
export const ArrowUpIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>arrow_upward</IconWrapper>);
export const ArrowsPointingOutIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>open_in_full</IconWrapper>);
export const ArrowsRightLeftIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>swap_horiz</IconWrapper>);
export const ArrowUturnLeftIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>undo</IconWrapper>);
export const ArrowUturnRightIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>redo</IconWrapper>);
export const Bars3Icon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>menu</IconWrapper>);
export const BoltIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>flash_on</IconWrapper>);
export const BoltSlashIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>flash_off</IconWrapper>);
export const BoltAutoIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>flash_auto</IconWrapper>);
export const BookOpenIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>menu_book</IconWrapper>);
export const BuildingOffice2Icon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>corporate_fare</IconWrapper>);
export const CameraIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>photo_camera</IconWrapper>);
export const ChatBubbleLeftRightIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>chat</IconWrapper>);
export const CheckIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>check</IconWrapper>);
export const CheckCircleIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>check_circle</IconWrapper>);
export const ChevronDownIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>expand_more</IconWrapper>);
export const ChevronRightIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>chevron_right</IconWrapper>);
export const ChevronUpIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>expand_less</IconWrapper>);
export const ClipboardDocumentCheckIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>playlist_add_check</IconWrapper>);
export const ClipboardDocumentIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>assignment</IconWrapper>);
export const ClockIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>schedule</IconWrapper>);
export const CogIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>settings</IconWrapper>);
export const CoinIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>paid</IconWrapper>);
export const ComputerDesktopIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>desktop_windows</IconWrapper>);
export const CreditCardIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>credit_card</IconWrapper>);
export const DocumentDuplicateIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>content_copy</IconWrapper>);
export const DocumentPlusIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>note_add</IconWrapper>);
export const DocumentTextIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>article</IconWrapper>);
export const DownloadIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>download</IconWrapper>);
export const DragIndicatorIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>drag_indicator</IconWrapper>);
export const EnvelopeIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>mail</IconWrapper>);
export const EyeIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>visibility</IconWrapper>);
export const FastForwardIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>fast_forward</IconWrapper>);
export const FileIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>insert_drive_file</IconWrapper>);
export const FolderIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>folder</IconWrapper>);
export const FolderPlusIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>create_new_folder</IconWrapper>);
export const HandThumbDownIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>thumb_down</IconWrapper>);
export const HandThumbUpIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>thumb_up</IconWrapper>);
export const InformationCircleIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>info</IconWrapper>);
export const LayersIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>layers</IconWrapper>);
export const LightBulbIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>lightbulb</IconWrapper>);
export const LockClosedIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>lock</IconWrapper>);
export const MagnifyingGlassIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>search</IconWrapper>);
export const MapPinIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>location_on</IconWrapper>);
export const MoonIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>dark_mode</IconWrapper>);
export const PaperAirplaneIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>send</IconWrapper>);
export const PauseIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>pause</IconWrapper>);
export const PencilIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>edit</IconWrapper>);
export const PlayIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>play_arrow</IconWrapper>);
export const PlusCircleIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>add_circle</IconWrapper>);
export const QuestionMarkCircleIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>help</IconWrapper>);
export const RectangleStackIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>stacks</IconWrapper>);
export const RestoreFromTrashIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>restore_from_trash</IconWrapper>);
export const RocketLaunchIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>rocket_launch</IconWrapper>);
export const ShieldCheckIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>verified_user</IconWrapper>);
export const ShieldExclamationIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>gpp_bad</IconWrapper>);
export const SparklesIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>auto_awesome</IconWrapper>);
export const Squares2X2Icon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>grid_view</IconWrapper>);
export const StopIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>stop</IconWrapper>);
export const SunIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>light_mode</IconWrapper>);
export const TagIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>label</IconWrapper>);
export const TrashIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>delete</IconWrapper>);
export const UserCircleIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>account_circle</IconWrapper>);
export const UsersIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>group</IconWrapper>);
export const ViewfinderCircleIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>center_focus_strong</IconWrapper>);
export const XCircleIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>cancel</IconWrapper>);
export const XMarkIcon: FC<HTMLAttributes<HTMLSpanElement>> = (props) => (<IconWrapper {...props}>close</IconWrapper>);