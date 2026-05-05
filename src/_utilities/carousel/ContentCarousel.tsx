"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

type BreakpointConfig = {
  mobile?: number;
  tablet?: number;
  desktop?: number;
};

interface ContentCarouselProps<T> {
  items: T[];
  title?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
  autoplay?: boolean;
  loop?: boolean;
  breakpoints?: BreakpointConfig;
  className?: string;
}

const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
};

export function ContentCarousel<T>({
  items,
  title,
  renderItem,
  autoplay = true,
  loop = true,
  breakpoints = DEFAULT_BREAKPOINTS,
  className,
}: Readonly<ContentCarouselProps<T>>) {
  const objectKeyCacheRef = useRef(new WeakMap<object, string>());
  const nextObjectKeyRef = useRef(0);
  const [slidesPerView, setSlidesPerView] = useState<number>(
    breakpoints.desktop ?? 3
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 576) {
        setSlidesPerView(breakpoints.mobile ?? 1);
      } else if (width < 992) {
        setSlidesPerView(breakpoints.tablet ?? 2);
      } else {
        setSlidesPerView(breakpoints.desktop ?? 3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoints]);

  const autoplayConfig = useMemo(
    () =>
      autoplay
        ? {
            delay: 2500,
            disableOnInteraction: false,
          }
        : false,
    [autoplay]
  );

  const keyedItems = useMemo(
    () => {
      const primitiveCounts = new Map<string, number>();
      return items.map((item) => {
        if (item !== null && typeof item === "object") {
          const objectItem = item as object;
          let key = objectKeyCacheRef.current.get(objectItem);
          if (!key) {
            key = `obj-${nextObjectKeyRef.current}`;
            nextObjectKeyRef.current += 1;
            objectKeyCacheRef.current.set(objectItem, key);
          }
          return { key, item };
        }

        const primitiveBaseKey = `${typeof item}:${String(item)}`;
        const currentCount = primitiveCounts.get(primitiveBaseKey) ?? 0;
        primitiveCounts.set(primitiveBaseKey, currentCount + 1);
        return { key: `${primitiveBaseKey}:${currentCount}`, item };
      });
    },
    [items]
  );

  if (!items?.length) return null;

  return (
    <section className={`py-1 card-grid ${className ?? ""}`}>
      <Container>
        {title && <h3 className="mb-3">{title}</h3>}

        <Row className="py-2">
          <Col>
            <Swiper
              slidesPerView={slidesPerView}
              spaceBetween={20}
              loop={loop}
              autoplay={autoplayConfig}
              modules={autoplay ? [Autoplay] : []}
            >
              {keyedItems.map(({ item, key }, index) => (
                <SwiperSlide key={key}>
                  {renderItem(item, index)}
                </SwiperSlide>
              ))}
            </Swiper>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
