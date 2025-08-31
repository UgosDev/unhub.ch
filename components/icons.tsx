import React, { type FC, type ReactNode, type SVGProps, type HTMLAttributes } from 'react';

// --- LOGHI ---

interface ScansioniChLogoIconProps extends SVGProps<SVGSVGElement> {
  lightFill?: string;
  darkFill?: string;
}

export const ScansioniChLogoIcon: FC<ScansioniChLogoIconProps> = ({ lightFill, darkFill, ...props }) => (
    <svg id="Livello_5" data-name="Livello 5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768.26 1477.64" {...props}>
      <polygon fill={lightFill || "var(--logo-light-fill, #c6a1fc)"} points="768.18 739.16 768.18 1034.82 512.19 886.99 512.19 887.02 512.15 887.02 512.12 886.99 0 591.33 .07 591.29 .07 591.33 256.06 443.53 256.09 443.53 512.12 591.33 768.18 739.16"/>
      <polygon fill={darkFill || "var(--logo-dark-fill, #9e5bfe)"} points="512.19 0 512.19 295.66 256.13 443.49 256.09 443.53 256.06 443.53 256.06 443.49 .07 591.29 .07 295.66 512.19 0"/>
      <polygon fill={darkFill || "var(--logo-dark-fill, #9e5bfe)"} points="768.26 1034.87 512.2 1182.7 256.14 1330.53 255.53 1330.15 .08 1477.64 .08 1182.7 256.14 1034.87 512.17 887.04 512.2 887.04 768.19 1034.87 768.19 1034.83 768.26 1034.87"/>
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
      <path fill={darkFill || "#9e5bfe"} d="M404.47,12.23c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.21-2.04,5.35-2.04s3.93.68,5.35,2.04c1.42,1.36,2.13,3.06,2.13,5.09s-.71,3.73-2.13,5.09c-1.42-1.36-3.21,2.05-5.35,2.05s-3.93-.68-5.35-2.05ZM415.82,20.02v48.21h-12.18V20.02h12.18Z"/>
    </g>
    <g>
      <path fill={lightFill || "#c6a1fc"} d="M427.79,66.79c-1.42-1.36-2.13-3.06-2.13-5.09s.71-3.73,2.13-5.09c1.42-1.36,3.23-2.04,5.44-2.04s3.92.68,5.31,2.04c1.39,1.36,2.09,3.06,2.09,5.09s-.7,3.73-2.09,5.09c-1.39,1.36-3.16,2.05-5.31,2.05s-4.02-.68-5.44-2.05Z"/>
      <path fill={lightFill || "#c6a1fc"} d="M450.38,31.03c2.03-3.74,4.84-6.64,8.44-8.7,3.6-2.06,7.72-3.09,12.36-3.09,5.98,0,10.92,1.49,14.84,4.48,3.92,2.99,6.54,7.18,7.88,12.58h-13.14c-.7-2.09-1.87-3.73-3.53-4.92-1.65-1.19-3.7-1.78-6.14-1.78-3.48,0-6.24,1.26-8.27,3.78-2.03,2.52-3.04,6.11-3.04,10.75s1.01,8.14,3.04,10.66,4.79,3.78,8.27,3.78c4.93,0,8.15-2.2,9.66-6.61h13.14c-1.33,5.22-3.97,9.37-7.92,12.45-3.95,3.08-8.88,4.61-14.8,4.61-4.64,0-8.76-1.03-12.36-3.09-3.6-2.06-6.41-4.96-8.44-8.7-2.03,3.74-3.05-8.11-3.05-13.1s1.02-9.36,3.05-13.1Z"/>
      <path fill={lightFill || "#c6a1fc"} d="M539.75,21.72c2.84,1.59,5.06,3.94,6.66,7.05,1.6,3.1,2.4,6.83,2.4,11.18v28.29h-12.18v-26.63c0-3.83-.96-6.77-2.87-8.83-1.91-2.06-4.52-3.09-7.83-3.09s-6.02,1.03-7.96,3.09c-1.94,2.06-2.92,5-2.92,8.83v26.63h-12.18V3.83h12.18v22.19c1.57-2.09,3.65-3.73,6.27-4.92,2.61-1.19,5.51-1.79,8.7-1.79,3.65,0,6.9.8,9.75,2.4Z"/>
    </g>
  </svg>
);

interface ArchivioChLogoIconProps extends SVGProps<SVGSVGElement> {
  lightFill?: string;
  darkFill?: string;
}
export const ArchivioChLogoIcon: FC<ArchivioChLogoIconProps> = ({ lightFill, darkFill, ...props }) => (
    <svg viewBox="0 0 100 100" {...props}>
      <path fill={darkFill || "var(--logo-dark-fill, #ef4444)"} d="M10 20 H90 V80 H10 Z M20 30 H80 V70 H20 Z" />
      <path fill={lightFill || "var(--logo-light-fill, #fca5a5)"} d="M50 40 a 10 10 0 1 0 0.001 0" />
      <path fill={lightFill || "var(--logo-light-fill, #fca5a5)"} d="M48 50 H52 V65 H48 Z" />
    </svg>
);
interface ArchivioChWordmarkIconProps extends SVGProps<SVGSVGElement> {
  fill?: string;
}
export const ArchivioChWordmarkIcon: FC<ArchivioChWordmarkIconProps> = ({ fill, ...props }) => (
    <svg viewBox="0 0 180 30" {...props}>
        <text x="0" y="22" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="24" fontWeight="bold" fill={fill || "currentColor"}>archivio.ch</text>
    </svg>
);
interface PolizzeChLogoIconProps extends SVGProps<SVGSVGElement> {
  lightFill?: string;
  darkFill?: string;
}
export const PolizzeChLogoIcon: FC<PolizzeChLogoIconProps> = ({ lightFill, darkFill, ...props }) => (
    <svg viewBox="0 0 100 100" {...props}>
      <path fill={darkFill || "var(--logo-dark-fill, #06b6d4)"} d="M50 10 L90 30 V70 L50 90 L10 70 V30 Z" />
      <path fill={lightFill || "var(--logo-light-fill, #67e8f9)"} d="M50 25 L80 40 V65 L50 80 L20 65 V40 Z" />
    </svg>
);
interface PolizzeChWordmarkIconProps extends SVGProps<SVGSVGElement> {
  fill?: string;
}
export const PolizzeChWordmarkIcon: FC<PolizzeChWordmarkIconProps> = ({ fill, ...props }) => (
    <svg viewBox="0 0 150 30" {...props}>
        <text x="0" y="22" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="24" fontWeight="bold" fill={fill || "currentColor"}>polizze.ch</text>
    </svg>
);
interface DisdetteChLogoIconProps extends SVGProps<SVGSVGElement> {
  lightFill?: string;
  darkFill?: string;
}
export const DisdetteChLogoIcon: FC<DisdetteChLogoIconProps> = ({ lightFill, darkFill, ...props }) => (
    <svg viewBox="0 0 100 100" {...props}>
        <path fill={darkFill || "var(--logo-dark-fill, #16a34a)"} d="M20 15 H80 V85 H20 Z M25 20 H75 V80 H25 Z" />
        <path stroke={lightFill || "var(--logo-light-fill, #4ade80)"} strokeWidth="6" d="M30 70 L70 30" />
    </svg>
);
interface DisdetteChWordmarkIconProps extends SVGProps<SVGSVGElement> {
  fill?: string;
}
export const DisdetteChWordmarkIcon: FC<DisdetteChWordmarkIconProps> = ({ fill, ...props }) => (
    <svg viewBox="0 0 160 30" {...props}>
        <text x="0" y="22" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="24" fontWeight="bold" fill={fill || "currentColor"}>disdette.ch</text>
    </svg>
);
interface UnHubChWordmarkIconProps extends SVGProps<SVGSVGElement> {
  fill?: string;
}
export const UnHubChWordmarkIcon: FC<UnHubChWordmarkIconProps> = ({ fill, ...props }) => (
    <svg viewBox="0 0 140 30" {...props}>
        <text x="0" y="22" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="24" fontWeight="bold" fill={fill || "currentColor"}>UnHub.ch</text>
    </svg>
);
export const GoogleIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 48 48" {...props}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
      <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);
export const WhatsappIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M16.75 13.96c.25.13.43.2.5.25.08.06.14.12.18.22.04.1.04.18.02.28-.02.1-.06.2-.12.3-.06.1-.14.18-.25.25-.11.07-.24.12-.4.15-.15.03-.33.02-.53-.02-.2-.04-.4-.1-.63-.18-.23-.08-.45-.18-.67-.3-.22-.12-.43-.25-.63-.4-.2-.14-.38-.3-.55-.45-.17-.16-.33-.32-.48-.5-.15-.18-.28-.37-.4-.57-.12-.2-.22-.4-.3-.6-.08-.2-.15-.4-.2-.58-.05-.18-.08-.35-.08-.53s.01-.33.05-.48c.04-.15.1-.28.18-.4.08-.12.18-.22.3-.3.12-.08.25-.13.38-.15.13-.02.26-.02.38.02.12.04.24.1.35.18.11.08.2.17.28.28.08.11.14.23.18.35.04.12.06.25.06.4v.04c-.01.07-.02.13-.04.18-.02.05-.05.1-.08.14-.04.04-.07.08-.1.1-.04.03-.07.05-.1.07-.03.02-.06.04-.08.05-.02.01-.05.02-.07.03-.02.01-.05.02-.06.02h-.02c-.02.01-.03.01-.05.02-.02,0-.03.01-.05.01-.02,0-.03.01-.04.01s-.03.01-.03.01h-.01c-.02,0-.03.01-.04.01s-.03.01-.03.01c-.01,0-.02,0-.03,0-.01,0-.02,0-.03,0h-.01c-.01,0-.02,0-.02,0-.01,0-.01,0-.02,0h-.01c-.03,0-.05-.01-.07-.02-.02-.01-.05-.02-.07-.03-.02-.01-.05-.02-.07-.04-.02-.01-.05-.03-.07-.04-.02-.02-.04-.03-.06-.05-.02-.02-.04-.04-.06-.06-.02-.02-.03-.05-.05-.07s-.03-.05-.04-.08c-.01-.03-.02-.06-.02-.08,0-.03.01-.05.01-.08.01-.03.02-.05.02-.08,0-.01,0-.02.01-.03,0-.01,0-.02,0-.03v-.02c.01-.06.02-.12.04-.18.02-.06.05-.12.08-.18.03-.06.08-.11.13-.15.05-.04.1-.08.16-.12.06-.04.12-.07.18-.1.06-.03.13-.05.2-.07.07-.02.14-.03.2-.04.07,0,.13-.01.2,0,.07,0,.13.01.2.02.07.01.13.03.18.05.06.02.1.05.15.08.05.03.08.07.12.11.04.04.06.09.08.14.02.05.03.1.04.15.01.05.02.1.02.15v.02c.02.1.03.2.03.3v.01zM11.91 2.37C5.79 2.37 1 7.15 1 13.28c0 2.22.63 4.3 1.76 6.08L1.31 23.33l4.23-1.4c1.7.93 3.63 1.43 5.66 1.43 6.13 0 10.91-4.78 10.91-10.91S18.04 2.37 11.91 2.37zm0 19.38c-1.88 0-3.68-.53-5.2-1.5l-.36-.23-3.87 1.28 1.3-3.78-.25-.38c-1.05-1.58-1.63-3.48-1.63-5.5C2.9 8.02 6.94 4 11.91 4s9.02 4.02 9.02 9.02-4.02 8.73-9.02 8.73z"></path>
    </svg>
);
export const HeartIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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