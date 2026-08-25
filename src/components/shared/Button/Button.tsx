import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "@/styles/shared/components/Button.module.css";

type CommonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "light";
  className?: string;
};
type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { to?: never };
type LinkProps = CommonProps & { to: string };

export function Button(props: ButtonProps | LinkProps) {
  const variant = props.variant ?? "primary";
  const classes = `${styles.button} ${styles[variant]} ${props.className ?? ""}`;
  if ("to" in props && props.to)
    return (
      <Link className={classes} to={props.to}>
        {props.children}
      </Link>
    );
  const {
    children,
    variant: buttonVariant,
    className: buttonClassName,
    ...buttonProps
  } = props as ButtonProps;
  void buttonVariant;
  void buttonClassName;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
