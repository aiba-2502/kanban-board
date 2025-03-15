declare module '@dnd-kit/core' {
  import { ReactNode } from 'react';

  export interface DragStartEvent {
    active: {
      id: string;
    };
  }

  export interface DragEndEvent {
    active: {
      id: string;
    };
    over: {
      id: string;
    } | null;
  }

  export interface DndContextProps {
    onDragStart?: (event: DragStartEvent) => void;
    onDragEnd?: (event: DragEndEvent) => void;
    collisionDetection?: any;
    children: ReactNode;
  }

  export interface DragOverlayProps {
    children?: ReactNode;
  }

  export interface UseDroppableArguments {
    id: string;
  }

  export interface UseDroppableReturnValue {
    setNodeRef: (element: HTMLElement | null) => void;
    over: boolean;
  }

  export function DndContext(props: DndContextProps): JSX.Element;
  export function DragOverlay(props: DragOverlayProps): JSX.Element;
  export function useDroppable(args: UseDroppableArguments): UseDroppableReturnValue;
  export function closestCorners(): any;
}

declare module '@dnd-kit/sortable' {
  export interface UseSortableArguments {
    id: string;
    disabled?: boolean;
  }

  export interface UseSortableReturnValue {
    attributes: {
      role: string;
    };
    listeners: {
      onKeyDown: (event: React.KeyboardEvent) => void;
      onMouseDown: (event: React.MouseEvent) => void;
      onTouchStart: (event: React.TouchEvent) => void;
    };
    setNodeRef: (element: HTMLElement | null) => void;
    transform: {
      x: number;
      y: number;
      scaleX: number;
      scaleY: number;
    } | null;
    transition: string | null;
  }

  export function useSortable(args: UseSortableArguments): UseSortableReturnValue;
}

declare module '@dnd-kit/utilities' {
  export const CSS: {
    Transform: {
      toString: (transform: any) => string;
    };
  };
}

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