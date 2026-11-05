import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** A 24×24 single-path stroke icon (the Untitled UI style used across the design). */
function strokeIcon(d: string, strokeWidth = 2, round: "cap" | "both" = "both") {
  function Icon(props: IconProps) {
    return (
      <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path
          d={d}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin={round === "both" ? "round" : undefined}
        />
      </svg>
    );
  }
  return Icon;
}

/* ---- hero ---- */
export const PlusIcon = strokeIcon("M12 5v14M5 12h14", 2, "cap");
export const SendIcon = strokeIcon("M12 19V5M6 11l6-6 6 6");
export const CloseSmallIcon = strokeIcon("M17 7L7 17M7 7l10 10", 2, "cap");
export const RemoveIcon = strokeIcon("M17 7L7 17M7 7l10 10", 2.2, "cap");
export const ConfirmIcon = strokeIcon("M5 12.5l4.5 4.5L19 7", 2.2);
export const CloseIcon = strokeIcon("M18 6L6 18M6 6l12 12", 2, "cap");
export const CodeIcon = strokeIcon("M8.5 8.5L5 12l3.5 3.5M15.5 8.5L19 12l-3.5 3.5");

export function MicIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MicFilledIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="4.4" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 2.5v2.6M12 18.9v2.6M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12h2.6M18.9 12h2.6M4.2 19.8L6 18M18 6l1.8-1.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Vertical currentColor fade (35% → 100%) used by the feature-card icons. */
function FadeGradient({ id, x, y1, y2 }: { id: string; x: number; y1: number; y2: number }) {
  return (
    <defs>
      <linearGradient id={id} x1={x} y1={y1} x2={x} y2={y2} gradientUnits="userSpaceOnUse">
        <stop stopColor="currentColor" stopOpacity=".35" />
        <stop offset="1" stopColor="currentColor" />
      </linearGradient>
    </defs>
  );
}

export function BrushIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4.45508 14.5559C5.87706 12.8295 8.39853 12.767 10.0088 14.3772C10.8837 15.2521 11.1596 16.3297 11.0596 17.3489C10.9626 18.337 10.5183 19.264 9.96582 19.9836C7.82863 22.7669 3.36534 22.5198 1.58496 19.427C1.40102 19.1073 1.40754 18.7127 1.60254 18.3997C1.79773 18.0867 2.14954 17.9064 2.51758 17.9309C2.93885 17.959 3.35892 17.7017 3.52637 17.3157C3.61881 17.1025 3.64743 16.9103 3.69434 16.5911V16.5881C3.7081 16.4945 3.72408 16.39 3.74316 16.2708C3.82037 15.7885 3.95913 15.158 4.45508 14.5559ZM20.376 2.09399C21.6604 1.41403 23.0505 2.80374 22.3711 4.08813L18.5225 11.3586C17.5068 13.2771 15.8225 14.748 13.7998 15.5012C13.2841 15.6931 12.7103 15.4329 12.5156 14.9182C11.9833 13.5102 10.9368 12.3937 9.56641 11.8489C9.05649 11.6462 8.80489 11.0706 9.00293 10.5588C9.76746 8.58326 11.2205 6.94064 13.1055 5.94263L20.376 2.09399ZM4.87891 2.72681C5.05581 2.16849 5.8465 2.16852 6.02344 2.72681L6.18359 3.23267C6.47825 4.16361 7.20773 4.89309 8.13867 5.18774L8.64355 5.3479C9.20215 5.5247 9.20215 6.31465 8.64355 6.49146L8.13867 6.65161C7.20779 6.94625 6.47828 7.67583 6.18359 8.60669L6.02344 9.11255C5.84664 9.67114 5.05571 9.67114 4.87891 9.11255L4.71875 8.60669C4.42408 7.67594 3.69539 6.94629 2.76465 6.65161L2.25879 6.49146C1.70019 6.31465 1.70019 5.5247 2.25879 5.3479L2.76465 5.18774C3.69543 4.89302 4.42413 4.16349 4.71875 3.23267L4.87891 2.72681Z"
        fill="url(#ic1)"
      />
      <FadeGradient id="ic1" x={12} y1={1.9} y2={21.9} />
    </svg>
  );
}

export function TemplatesIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M3 16C3 13.1716 3 11.7574 3.87868 10.8787C4.75736 10 6.17157 10 9 10H15C17.8284 10 19.2426 10 20.1213 10.8787C21 11.7574 21 13.1716 21 16C21 18.8284 21 20.2426 20.1213 21.1213C19.2426 22 17.8284 22 15 22H9C6.17157 22 4.75736 22 3.87868 21.1213C3 20.2426 3 18.8284 3 16Z" fill="url(#ic2)" />
      <path d="M5 7C5 6.44772 5.44772 6 6 6H18C18.5523 6 19 6.44772 19 7C19 7.55228 18.5523 8 18 8H6C5.44772 8 5 7.55228 5 7Z" fill="url(#ic2)" />
      <path d="M7 3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3C17 3.55228 16.5523 4 16 4H8C7.44772 4 7 3.55228 7 3Z" fill="url(#ic2)" />
      <FadeGradient id="ic2" x={12} y1={2} y2={22} />
    </svg>
  );
}

export function VoiceSparkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M19.3459 10.1538C19.8557 10.1538 20.2689 10.5671 20.2689 11.0769V12.4615C20.2689 16.9929 16.832 20.7208 12.4228 21.1821V23.0769C12.4228 23.5867 12.0095 24 11.4997 24C10.9899 24 10.5766 23.5867 10.5766 23.0769V21.1821C6.16743 20.7208 2.73047 16.9929 2.73047 12.4615V11.0769C2.73047 10.5671 3.14374 10.1538 3.65355 10.1538C4.16335 10.1538 4.57662 10.5671 4.57662 11.0769V12.4615C4.57662 16.285 7.67619 19.3846 11.4997 19.3846C15.3232 19.3846 18.4228 16.285 18.4228 12.4615V11.0769C18.4228 10.5671 18.8361 10.1538 19.3459 10.1538Z" fill="url(#ic3)" />
      <path d="M9.20012 4.38642C9.3142 6.03008 10.6288 7.1158 11.9558 7.30529C12.3157 7.3567 12.5151 7.4266 12.6121 7.47025C12.6576 7.49075 12.6815 7.50544 12.6914 7.51262C12.7177 7.54864 12.8382 7.74583 12.9195 8.32752C13.1394 9.90196 14.3868 10.8518 15.6535 11.04V12.4615C15.6535 14.7556 13.7938 16.6154 11.4997 16.6154C9.20559 16.6154 7.34585 14.7556 7.34585 12.4615V7.84615C7.34585 6.40247 8.08236 5.13084 9.20012 4.38642Z" fill="url(#ic3)" />
      <path d="M16.5679 0.363012C16.5389 0.155519 16.3449 0 16.1151 0C15.8852 0 15.6912 0.15552 15.6623 0.363012C15.5152 1.41566 15.2031 2.17437 14.6953 2.70675C14.1944 3.23196 13.4567 3.58502 12.3469 3.74348C12.1249 3.77519 11.9612 3.9493 11.9612 4.15385C11.9612 4.3584 12.1249 4.5325 12.3469 4.56421C13.4567 4.72267 14.1944 5.07573 14.6953 5.60094C15.2031 6.13332 15.5152 6.89203 15.6623 7.94468C15.6912 8.15217 15.8852 8.30769 16.1151 8.30769C16.3449 8.30769 16.5389 8.15217 16.5679 7.94468C16.7149 6.89203 17.0271 6.13332 17.5348 5.60094C18.0358 5.07573 18.7735 4.72267 19.8832 4.56421C20.1053 4.5325 20.2689 4.3584 20.2689 4.15385C20.2689 3.9493 20.1053 3.77519 19.8832 3.74348C18.7131 3.57641 17.9746 3.20104 17.4877 2.6695C16.9919 2.1282 16.709 1.37338 16.5679 0.363012Z" fill="url(#ic3)" />
      <FadeGradient id="ic3" x={11.5} y1={0} y2={24} />
    </svg>
  );
}

/* ---- sign-up ---- */
export function GoogleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...props}>
      <path d="M19.6 10.23c0-.68-.06-1.36-.18-2.02H10v3.82h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.23c1.9-1.74 2.97-4.3 2.97-7.33z" fill="#4285F4" />
      <path d="M10 20c2.7 0 4.96-.9 6.62-2.42l-3.23-2.5c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H1.07v2.58A10 10 0 0 0 10 20z" fill="#34A853" />
      <path d="M4.41 11.92a6 6 0 0 1 0-3.84V5.5H1.07a10 10 0 0 0 0 9z" fill="#FBBC05" />
      <path d="M10 3.96c1.47 0 2.79.5 3.83 1.5l2.86-2.86A9.5 9.5 0 0 0 10 0 10 10 0 0 0 1.07 5.5l3.34 2.58C5.2 5.72 7.4 3.96 10 3.96z" fill="#EA4335" />
    </svg>
  );
}

export function GmailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 18" {...props}>
      <path d="M1.64 18h3.82V8.73L0 4.64v11.72C0 17.27.74 18 1.64 18z" fill="#4285F4" />
      <path d="M18.55 18h3.81c.91 0 1.64-.74 1.64-1.64V4.64l-5.45 4.09" fill="#34A853" />
      <path d="M18.55 1.64v7.09L24 4.64V2.45C24 .43 21.69-.72 20.07.5" fill="#FBBC04" />
      <path d="M5.46 8.73V1.64L12 6.55l6.55-4.91v7.09L12 13.64" fill="#EA4335" />
      <path d="M0 2.45v2.19l5.46 4.09V1.64L3.93.5C2.31-.72 0 .43 0 2.45z" fill="#C5221F" />
    </svg>
  );
}

export function AppleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M13.62 10.6c.02 2.3 2.01 3.06 2.03 3.07-.02.05-.32 1.1-1.05 2.18-.63.94-1.29 1.87-2.33 1.89-1.02.02-1.35-.6-2.51-.6-1.17 0-1.53.58-2.5.62-1 .04-1.76-1.01-2.4-1.95-1.3-1.9-2.3-5.36-.96-7.7a3.73 3.73 0 0 1 3.15-1.92c.98-.02 1.9.66 2.5.66.6 0 1.72-.81 2.9-.69.49.02 1.88.2 2.77 1.5-.07.05-1.65.97-1.63 2.9M11.72 3.9c.53-.64.89-1.53.79-2.42-.76.03-1.69.51-2.24 1.15-.49.56-.92 1.47-.8 2.34.85.06 1.71-.43 2.25-1.07" />
    </svg>
  );
}

export function GitHubIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 0C4.48 0 0 4.48 0 10a10 10 0 0 0 6.84 9.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.26-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.39.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85l-.01 2.75c0 .27.18.58.69.48A10 10 0 0 0 20 10c0-5.52-4.48-10-10-10z"
      />
    </svg>
  );
}

/* ---- intent flow (Untitled UI set) ---- */
export const CheckIcon = strokeIcon("M20 6 9 17l-5-5");
export const CheckBoldIcon = strokeIcon("M20 6 9 17l-5-5", 3);
export const ChevronLeftIcon = strokeIcon("m15 18-6-6 6-6");
export const ChevronRightIcon = strokeIcon("m9 18 6-6-6-6");
export const ChevronDownIcon = strokeIcon("m6 9 6 6 6-6");
export const ArrowRightIcon = strokeIcon("M5 12h14m0 0-7-7m7 7-7 7");
export const ArrowLeftIcon = strokeIcon("M20 12H4m0 0 6 6m-6-6 6-6");
export const NavRightIcon = strokeIcon("M4 12h16m0 0-6-6m6 6-6 6");
export const XIcon = strokeIcon("M18 6 6 18M6 6l12 12");
export const UploadIcon = strokeIcon("M4 16.242A4.5 4.5 0 0 1 6.08 8.02a6.002 6.002 0 0 1 11.84 0A4.5 4.5 0 0 1 20 16.242M8 16l4-4m0 0 4 4m-4-4v9");
export const ExpandIcon = strokeIcon("M21 9V3m0 0h-6m6 0-8 8m-3-6H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C3 7.28 3 8.12 3 9.8v6.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C5.28 21 6.12 21 7.8 21h6.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C19 18.72 19 17.88 19 16.2V14");
export const DiceIcon = strokeIcon("M8.5 8.5h.01m6.99 6.99h.01M7.8 21h8.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C21 18.72 21 17.88 21 16.2V7.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C18.72 3 17.88 3 16.2 3H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C3 5.28 3 6.12 3 7.8v8.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C5.28 21 6.12 21 7.8 21Z");
export const CheckCircleIcon = strokeIcon("M7.5 12l3 3 6-6M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z");
export const AddIcon = strokeIcon("M12 5v14m-7-7h14");
export const VoiceIcon = strokeIcon("M19 10v2a7 7 0 0 1-14 0v-2m7 9v3m-4 0h8m-4-7a3 3 0 0 1-3-3V5a3 3 0 1 1 6 0v7a3 3 0 0 1-3 3Z");
export const ShareIcon = strokeIcon("M21 11 14 4v4C7 9 4 14 3 19c2.5-3.5 6-5.1 11-5.1V18l7-7Z");
export const DownloadIcon = strokeIcon("M21 15v1.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2V15m14-5-5 5m0 0-5-5m5 5V3");

export function StopIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" />
    </svg>
  );
}

/* ---- sign-up: password step ---- */
export const PencilIcon = strokeIcon("M18 10l-4-4M2.5 21.5l3.384-.376c.414-.046.62-.069.814-.131a2 2 0 0 0 .485-.234c.17-.111.317-.259.61-.553L21 7a2.828 2.828 0 1 0-4-4L3.794 16.206c-.294.294-.442.442-.553.611a2 2 0 0 0-.234.485c-.062.193-.085.4-.131.814L2.5 21.5Z");
export const EyeIcon = strokeIcon("M2.42 12.713c-.136-.215-.204-.323-.242-.49a1.173 1.173 0 0 1 0-.446c.038-.167.106-.274.242-.49C3.546 9.505 6.895 5 12 5s8.455 4.505 9.58 6.287c.137.215.205.323.243.49.029.125.029.322 0 .446-.038.167-.106.274-.242.49C20.455 14.495 17.105 19 12 19c-5.105 0-8.455-4.505-9.58-6.287ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z");
export const EyeOffIcon = strokeIcon("M10.743 5.092A9.79 9.79 0 0 1 12 5c5.105 0 8.455 4.505 9.58 6.287.137.215.205.323.243.49.029.125.029.322 0 .447-.038.166-.107.274-.244.492-.3.474-.757 1.141-1.363 1.865M6.724 6.715c-2.162 1.467-3.63 3.504-4.303 4.57-.137.217-.205.325-.243.492a1.173 1.173 0 0 0 0 .446c.038.167.106.274.242.49C3.546 14.495 6.895 19 12 19c2.059 0 3.832-.732 5.289-1.723M3 3l18 18M9.88 9.879a3 3 0 0 0 4.243 4.243");
export const AlertCircleIcon = strokeIcon("M12 8v4m0 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z");
export const XCircleIcon = strokeIcon("m15 9-6 6m0-6 6 6m7-3c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z");
export const CircleIcon = strokeIcon("M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z");

/* ---- onboarding: roles (1.5px strokes) ---- */
export const BuildingIcon = strokeIcon("M3 21h18M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16M14 9h4a1 1 0 0 1 1 1v11M8.5 8h2M8.5 12h2M8.5 16h2", 1.5);
export const PaletteIcon = strokeIcon("M12 21a9 9 0 1 1 9-9c0 2.2-1.8 3.5-4 3.5h-1.6c-1.2 0-2 1.3-1.4 2.4.6 1.2-.2 3.1-2 3.1ZM7.5 11.5h.01M9.5 7.5h.01M14.5 7.5h.01", 1.5);
export const TerminalIcon = strokeIcon("m4 7 5 5-5 5M12 18h8", 1.5);
export const ProductIcon = strokeIcon("M20 12v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h6M21 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z", 1.5);
export const TargetIcon = strokeIcon("M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM12 2v3M12 19v3M2 12h3M19 12h3", 1.5);
export const DiamondIcon = strokeIcon("M2.5 9.5 6.5 4h11l4 5.5L12 20.5 2.5 9.5ZM2.5 9.5h19M10 4 8.5 9.5 12 20.5l3.5-11L14 4", 1.5);
export const GraduationIcon = strokeIcon("M2 9.5 12 5l10 4.5-10 4.5L2 9.5ZM6 11.5v4.5c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5", 1.5);
export const UserIcon = strokeIcon("M20 21c0-3.3-3.6-6-8-6s-8 2.7-8 6M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z", 1.5);
