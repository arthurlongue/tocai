import { Slider as SliderPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

function Slider({
	className,
	defaultValue,
	value,
	min = 0,
	max = 100,
	variant = "default",
	...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
	variant?: "default" | "triangular";
}) {
	const _values = React.useMemo(
		() =>
			Array.isArray(value)
				? value
				: Array.isArray(defaultValue)
					? defaultValue
					: [min, max],
		[value, defaultValue, min, max],
	);

	const isTriangular = variant === "triangular";

	return (
		<SliderPrimitive.Root
			data-slot="slider"
			defaultValue={defaultValue}
			value={value}
			min={min}
			max={max}
			className={cn(
				"relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
				className,
			)}
			{...props}
		>
			<SliderPrimitive.Track
				data-slot="slider-track"
				className={cn(
					"relative grow overflow-hidden bg-muted data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
					isTriangular
						? "data-[orientation=horizontal]:h-3"
						: "rounded-full data-[orientation=horizontal]:h-1.5",
				)}
				style={
					isTriangular
						? { clipPath: "polygon(0% 100%, 100% 0%, 100% 100%, 0% 100%)" }
						: {}
				}
			>
				<SliderPrimitive.Range
					data-slot="slider-range"
					className={cn(
						"absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
					)}
				/>
			</SliderPrimitive.Track>
			{Array.from({ length: _values.length }, (_, index) => (
				<SliderPrimitive.Thumb
					data-slot="slider-thumb"
					key={index}
					aria-label={props["aria-label"]}
					aria-valuemin={min}
					aria-valuemax={max}
					aria-valuenow={_values[index]}
					className={cn(
						"block size-4 shrink-0 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--background))] ring-ring/50 transition-[color,box-shadow] hover:ring-4 hover:ring-primary/30 focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
						isTriangular && "mt-1", // Shift thumb slightly down to center it on the slanted track if needed
					)}
				/>
			))}
		</SliderPrimitive.Root>
	);
}

export { Slider };
