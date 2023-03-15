/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-restricted-syntax */
import baseMsg from "./br";	
import en from './en'

const messages = {
  br: baseMsg, en
}

function hasLocale(locale: string): locale is keyof typeof messages {
  return locale in messages;
}

export function t(locale: keyof typeof messages | readonly string[] = navigator.languages): typeof baseMsg & Record<string, undefined> {
  if (typeof locale === 'string' && hasLocale(locale)) {
    // @ts-ignore
    return {
      ...baseMsg,
      ...messages[locale],
    };
  }
  if (Array.isArray(locale)) {
    for (const l of locale) {
      if (hasLocale(l)) {
        // @ts-ignore
        return {
          ...baseMsg,
          ...messages[l],
        };
      }
    }
  }
  // @ts-ignore
  return baseMsg;
}

export function t_or(key: string, locale: keyof typeof messages | readonly string[] = navigator.languages): string {
  const msg = t(locale)[key];
  if (typeof msg !== 'string') return key;
  return msg;
}