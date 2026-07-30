"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type RefObject,
  type ReactNode,
} from "react";

type CarouselContextValue = {
  viewportRef: RefObject<HTMLDivElement | null>;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarouselContext() {
  const value = useContext(CarouselContext);
  if (!value) {
    throw new Error("Carousel components must be used within <Carousel>.");
  }
  return value;
}

function updateScrollState(
  viewport: HTMLDivElement | null,
  setPrev: (value: boolean) => void,
  setNext: (value: boolean) => void,
) {
  if (!viewport) {
    setPrev(false);
    setNext(false);
    return;
  }

  const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
  setPrev(viewport.scrollLeft > 4);
  setNext(viewport.scrollLeft < maxScrollLeft - 4);
}

export function Carousel({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // One viewport-width per press. Cards span the viewport exactly, so this
  // advances a whole page and scroll-snap settles it on a card edge.
  const scrollBy = (direction: 1 | -1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({ left: direction * viewport.clientWidth, behavior: "smooth" });
  };

  const scrollPrev = () => scrollBy(-1);
  const scrollNext = () => scrollBy(1);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const update = () => updateScrollState(viewport, setCanScrollPrev, setCanScrollNext);
    update();
    viewport.addEventListener("scroll", update, { passive: true });

    // Track resizes too: images finishing load or a breakpoint change alters
    // scrollWidth without ever firing a scroll event, which would strand the
    // arrows in a stale enabled/disabled state.
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    const track = viewport.firstElementChild;
    if (track) observer.observe(track);

    return () => {
      viewport.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  return (
    <CarouselContext.Provider value={{ viewportRef, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}>
      <div className={["relative", className].filter(Boolean).join(" ")} {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

// Vertical padding only: it gives the cards' hover lift and shadow room to
// breathe without shifting the horizontal scroll-snap origin.
const viewportClass =
  "-my-2 overflow-x-auto py-2 [scrollbar-width:none] [scroll-snap-type:x_mandatory] [&::-webkit-scrollbar]:hidden";

export function CarouselContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { viewportRef } = useCarouselContext();

  return (
    <div className={viewportClass} ref={viewportRef}>
      <div className={["flex items-stretch gap-[18px]", className].filter(Boolean).join(" ")} {...props}>
        {children}
      </div>
    </div>
  );
}

// The basis subtracts the gutters the track adds, so N cards span the viewport
// exactly. A plain `basis-1/3` overflows by 2 gaps and clips the last card.
// Keep these widths in step with the `gap-[18px]` on the track above.
const itemClass = [
  "min-w-0 shrink-0 grow-0 basis-full [scroll-snap-align:start]",
  "md:basis-[calc((100%_-_18px)/2)]",
  "min-[1100px]:basis-[calc((100%_-_36px)/3)]",
].join(" ");

export function CarouselItem({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={[itemClass, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

// Styled standalone rather than layered on btnSecondary: that button's px-6/py-3
// outranks a p-0 override in Tailwind's cascade, which fights the fixed 44px box.
const carouselButtonClass =
  "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line-2 bg-surface text-lg text-ink shadow-card transition duration-150 ease-soft hover:-translate-y-px hover:border-ink-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:border-line-2";

function CarouselButton({
  direction,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { direction: "prev" | "next"; children: ReactNode }) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarouselContext();
  const disabled = direction === "prev" ? !canScrollPrev : !canScrollNext;
  const onClick = direction === "prev" ? scrollPrev : scrollNext;

  return (
    <button
      type="button"
      className={[carouselButtonClass, className].filter(Boolean).join(" ")}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export function CarouselPrevious(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <CarouselButton direction="prev" aria-label="Vorherige Karten" {...props}>
      ←
    </CarouselButton>
  );
}

export function CarouselNext(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <CarouselButton direction="next" aria-label="Nächste Karten" {...props}>
      →
    </CarouselButton>
  );
}
