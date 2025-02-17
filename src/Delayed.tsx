import { useSpring, animated } from "@react-spring/web";
import React, { ElementType, useMemo } from "react";

interface DelayedProps {
  as?: React.ElementType;
  delay?: number;
  show?: boolean;
  children?: React.ReactNode;
  maxOpacity?: number;
}

export const Delayed = ({
  as = "div",
  delay = 300,
  show = true,
  maxOpacity = 1,
  ...props
}: DelayedProps &
  Omit<React.ComponentPropsWithoutRef<ElementType>, keyof DelayedProps>) => {
  const rnd = useMemo(() => Math.random() * delay, [delay]);
  const [styleProps] = useSpring(
    {
      from: { opacity: show ? 0 : maxOpacity },
      to: { opacity: show ? maxOpacity : 0 },
      delay: rnd,
      duration: 400,
    },
    [rnd, show]
  );
  //console.log(as);
  // @ts-ignore TODO
  const Component = animated[as.toString()];

  return <Component style={styleProps} {...props} />;
};
