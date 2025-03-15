/// <reference types="react" />
/// <reference types="react-dom" />

declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.svg' {
  import * as React from 'react';

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  const src: string;
  export default src;
}

// モジュール宣言を追加
declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export const Plus: FC<SVGProps<SVGSVGElement> & { size?: number }>;
  export const Edit2: FC<SVGProps<SVGSVGElement> & { size?: number }>;
  export const Trash2: FC<SVGProps<SVGSVGElement> & { size?: number }>;
  export const Clock: FC<SVGProps<SVGSVGElement> & { size?: number }>;
  export const X: FC<SVGProps<SVGSVGElement> & { size?: number }>;
  export const Check: FC<SVGProps<SVGSVGElement> & { size?: number }>;
  export const RefreshCw: FC<SVGProps<SVGSVGElement> & { size?: number }>;
  export const AlertCircle: FC<SVGProps<SVGSVGElement> & { size?: number }>;
}