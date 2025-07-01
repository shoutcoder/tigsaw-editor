interface Element {
  id: string;
  type: string;
  tag: string;
  content?: string;
  // Responsive styles - desktop is base, others only override when specifically set
  styles: {
    desktop: Record<string, any> & {
      // Ensure other styles are still allowed
      fontFamily?: string;
      fontFaceUrl?: string;
    };
    tablet?: Record<string, any> & {
      fontFamily?: string;
      fontFaceUrl?: string;
    };
    mobile?: Record<string, any> & {
      fontFamily?: string;
      fontFaceUrl?: string;
    };
  };
  attributes: Record<string, any>;
  children: Element[];
  parent?: string;
  // Interactive states
  states?: {
    default: {
      styles: Record<string, any>;
      content?: string;
      visible: boolean;
    };
    hover?: {
      styles: Record<string, any>;
      content?: string;
    };
    active?: {
      styles: Record<string, any>;
      content?: string;
    };
    [key: string]: any;
  };
  currentState?: string;
  interactions?: {
    onClick?: {
      action: "toggle" | "show" | "hide" | "navigate";
      target?: string;
      value?: any;
    };
    onHover?: {
      action: "show" | "hide";
      target?: string;
    };
  };
}