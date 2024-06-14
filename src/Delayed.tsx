import { useSpring, animated } from "@react-spring/web";
import React, { ElementType, useMemo } from "react";

interface DelayedProps {
  as?: React.ElementType;
  delay?: number;
  show?: boolean;
  children?: React.ReactNode;
}

export const Delayed = ({
  as = "div",
  delay = 300,
  show = true,
  ...props
}: DelayedProps &
  Omit<React.ComponentPropsWithoutRef<ElementType>, keyof DelayedProps>) => {
  const rnd = useMemo(() => Math.random() * delay, [delay]);
  const [styleProps] = useSpring(
    {
      from: { opacity: show ? 0 : 1 },
      to: { opacity: show ? 1 : 0 },
      delay: rnd,
      duration: 400,
    },
    [rnd, show]
  );
  const Component = animated[as.toString()];

  return <Component style={styleProps} {...props} />;
};
