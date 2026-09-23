import type {ReactNode, Ref} from 'react';

export type ResetCodeFieldKey = 'one' | 'two' | 'three' | 'four' | 'five' | 'six';

export type AuthIllustration = {image: string; color: string};

export type AuthLayoutProps = {
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
};
