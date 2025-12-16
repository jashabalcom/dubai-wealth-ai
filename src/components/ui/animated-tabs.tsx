import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { smoothTransition, quickTransition } from "@/lib/motion";

const AnimatedTabs = TabsPrimitive.Root;

interface AnimatedTabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  layoutId?: string;
}

const AnimatedTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  AnimatedTabsListProps
>(({ className, layoutId = "tab-indicator", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "relative inline-flex h-11 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
));
AnimatedTabsList.displayName = "AnimatedTabsList";

interface AnimatedTabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  layoutId?: string;
}

const AnimatedTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  AnimatedTabsTriggerProps
>(({ className, layoutId = "tab-indicator", children, ...props }, ref) => {
  const [isActive, setIsActive] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const trigger = triggerRef.current;
    if (trigger) {
      const checkActive = () => {
        setIsActive(trigger.getAttribute('data-state') === 'active');
      };
      checkActive();
      const observer = new MutationObserver(checkActive);
      observer.observe(trigger, { attributes: true, attributeFilter: ['data-state'] });
      return () => observer.disconnect();
    }
  }, []);

  return (
    <TabsPrimitive.Trigger
      ref={(node) => {
        (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:text-foreground",
        "data-[state=inactive]:hover:text-foreground/80",
        className,
      )}
      {...props}
    >
      {isActive && (
        <motion.div
          layoutId={layoutId}
          className="absolute inset-0 rounded-md bg-background shadow-sm"
          transition={smoothTransition}
          style={{ zIndex: -1 }}
        />
      )}
      <motion.span
        initial={false}
        animate={{
          scale: isActive ? 1 : 0.98,
        }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.span>
    </TabsPrimitive.Trigger>
  );
});
AnimatedTabsTrigger.displayName = "AnimatedTabsTrigger";

interface AnimatedTabsContentProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  forceMount?: true;
}

const AnimatedTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  AnimatedTabsContentProps
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  >
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={quickTransition}
    >
      {children}
    </motion.div>
  </TabsPrimitive.Content>
));
AnimatedTabsContent.displayName = "AnimatedTabsContent";

export { AnimatedTabs, AnimatedTabsList, AnimatedTabsTrigger, AnimatedTabsContent };
