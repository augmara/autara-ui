'use client'

import * as React from 'react'
import { motion, type HTMLMotionProps } from 'motion/react'
import { cn } from '../lib/cn'

/** Fade in from bottom */
export function FadeIn({
    className,
    children,
    delay = 0,
    duration = 0.5,
    ...props
}: HTMLMotionProps<'div'> & { delay?: number; duration?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
            className={cn(className)}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/** Fade in when scrolled into viewport */
export function FadeInView({
    className,
    children,
    delay = 0,
    duration = 0.6,
    ...props
}: HTMLMotionProps<'div'> & { delay?: number; duration?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
            className={cn(className)}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/** Scale in animation */
export function ScaleIn({
    className,
    children,
    delay = 0,
    duration = 0.5,
    ...props
}: HTMLMotionProps<'div'> & { delay?: number; duration?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
            className={cn(className)}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/** Stagger children animations */
export function StaggerContainer({
    className,
    children,
    staggerDelay = 0.08,
    ...props
}: HTMLMotionProps<'div'> & { staggerDelay?: number }) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {},
                visible: { transition: { staggerChildren: staggerDelay } },
            }}
            className={cn(className)}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/** Item for use inside StaggerContainer */
export function StaggerItem({
    className,
    children,
    ...props
}: HTMLMotionProps<'div'>) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
            }}
            className={cn(className)}
            {...props}
        >
            {children}
        </motion.div>
    )
}
