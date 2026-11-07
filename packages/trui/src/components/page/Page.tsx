// Copyright 2026 The TRUI Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useText } from '@tim-riep/trui/core';
import {
  createElement,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { chevronDownIcon } from '../../icons/set/chevron-down';
import { chevronUpIcon } from '../../icons/set/chevron-up';
import { pinIcon } from '../../icons/set/pin';
import { cx } from '../../internal/class-names';
import { Button } from '../button/Button';

/** Props of {@link Page}. */
export interface PageProps extends HTMLAttributes<HTMLDivElement> {
  /** The header, usually a `PageHeader`; it scrolls with the content. */
  header?: ReactNode;
  /** A bar at the bottom that stays visible, e.g. with Save and Cancel. */
  footer?: ReactNode;
  /** Background of the content: the page background or the surface color. */
  background?: 'page' | 'surface';
  ref?: Ref<HTMLDivElement>;
}

/**
 * A page of an application: header, scrolling content and an optional
 * footer that stays visible. It fills the height of its parent.
 */
export function Page({
  header,
  footer,
  background = 'page',
  className,
  children,
  ref,
  ...rest
}: PageProps) {
  return (
    <div ref={ref} className={cx('trui-page', `trui-page--${background}`, className)} {...rest}>
      <div className="trui-page__scroller" data-trui-scroll="">
        {header}
        <div className="trui-page__content">{children}</div>
      </div>
      {footer !== undefined && <div className="trui-page__footer">{footer}</div>}
    </div>
  );
}

/** Props of {@link PageHeader}. */
export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Title of the page, e.g. the name of an object. */
  title: ReactNode;
  /** Level of the title; 1 by default. */
  headingLevel?: 1 | 2 | 3;
  /** A line below the title, e.g. the key of the object. */
  subtitle?: ReactNode;
  /** The path to the page, usually `Breadcrumbs`. */
  breadcrumbs?: ReactNode;
  /** Shown next to the title, e.g. a status tag. */
  status?: ReactNode;
  /** Shown before the title, e.g. an avatar. */
  avatar?: ReactNode;
  /** Actions in the title row, e.g. buttons or a toolbar. */
  actions?: ReactNode;
  /**
   * Key facts and figures below the title. While the content scrolls they
   * scroll away and the title row stays; the toggle button brings them back.
   */
  children?: ReactNode;
  /** Offers a button that keeps the whole header visible. On by default. */
  pinnable?: boolean;
  /** Ref to the header element, the title row. */
  ref?: Ref<HTMLElement>;
}

/**
 * The header of a page with title, facts and actions. The title row stays at
 * the top while the content scrolls; the facts below it scroll away and can
 * be brought back with a button, or the header can be pinned.
 *
 * Keyboard: the toggle and pin buttons are regular buttons.
 */
export function PageHeader({
  title,
  headingLevel = 1,
  subtitle,
  breadcrumbs,
  status,
  avatar,
  actions,
  children,
  pinnable = true,
  className,
  ref,
  ...rest
}: PageHeaderProps) {
  const t = useText();
  const contentId = useId();
  const barRef = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => barRef.current!, []);
  const endRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(false);
  const hasContent = children !== undefined && children !== null && children !== false;

  // Height of the title row, for the facts that stick below it when pinned.
  const [barHeight, setBarHeight] = useState(0);
  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const update = () => setBarHeight(bar.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const bar = barRef.current;
    const end = endRef.current;
    if (!bar || !end || !hasContent || pinned) {
      setCollapsed(false);
      return;
    }
    const scroller = bar.closest<HTMLElement>('[data-trui-scroll]');
    const target: HTMLElement | Window = scroller ?? window;
    const update = () =>
      setCollapsed(end.getBoundingClientRect().top <= bar.getBoundingClientRect().bottom + 1);
    update();
    target.addEventListener('scroll', update, { passive: true });
    return () => target.removeEventListener('scroll', update);
  }, [hasContent, pinned]);

  const toggle = () => {
    const bar = barRef.current;
    const end = endRef.current;
    const scroller = bar?.closest<HTMLElement>('[data-trui-scroll]');
    if (!bar || !end || !scroller) return;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
    if (collapsed) scroller.scrollTo({ top: 0, behavior });
    else {
      const offset = end.getBoundingClientRect().top - bar.getBoundingClientRect().bottom;
      scroller.scrollTo({ top: scroller.scrollTop + offset, behavior });
    }
  };

  // The title row and the facts are siblings in the scrolling area, so that
  // the title row sticks to its top while the facts scroll away below it.
  return (
    <>
      <header
        ref={barRef}
        className={cx(
          'trui-page-header',
          collapsed && 'trui-page-header--collapsed',
          hasContent && 'trui-page-header--with-content',
          className,
        )}
        {...rest}
      >
        {breadcrumbs !== undefined && (
          <div className="trui-page-header__breadcrumbs">{breadcrumbs}</div>
        )}
        <div className="trui-page-header__row">
          {avatar !== undefined && <div className="trui-page-header__avatar">{avatar}</div>}
          <div className="trui-page-header__heading">
            <div className="trui-page-header__title-row">
              {createElement(`h${headingLevel}`, { className: 'trui-page-header__title' }, title)}
              {status !== undefined && <div className="trui-page-header__status">{status}</div>}
            </div>
            {subtitle !== undefined && <div className="trui-page-header__subtitle">{subtitle}</div>}
          </div>
          {actions !== undefined && <div className="trui-page-header__actions">{actions}</div>}
          {hasContent && (
            <div className="trui-page-header__controls">
              {pinnable && (
                <Button
                  variant="text"
                  icon={pinIcon}
                  aria-label={t('pageHeader.pin')}
                  pressed={pinned}
                  onClick={() => setPinned(!pinned)}
                />
              )}
              {!pinned && (
                <Button
                  variant="text"
                  icon={collapsed ? chevronDownIcon : chevronUpIcon}
                  aria-label={collapsed ? t('pageHeader.expand') : t('pageHeader.collapse')}
                  aria-expanded={!collapsed}
                  aria-controls={contentId}
                  onClick={toggle}
                />
              )}
            </div>
          )}
        </div>
      </header>
      {hasContent && (
        <div
          id={contentId}
          className={cx('trui-page-header__content', pinned && 'trui-page-header__content--pinned')}
          style={pinned ? { top: barHeight } : undefined}
        >
          {children}
        </div>
      )}
      <div ref={endRef} />
    </>
  );
}
