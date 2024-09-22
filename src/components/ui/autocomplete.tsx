import React, { useState } from "react"
import ReactDOM from "react-dom"
import mergeRefs from "merge-refs"

import { cn } from "~/lib/utils"
import { createDiff, extractChanges, isRefElementClicked } from "~/utils"
import { Button } from "~/components/ui/button"
import { Input, Input_borderCls } from "~/components/ui/input"
import { Slot } from "@radix-ui/react-slot"

type AutocompleteContextValue = {
  contextId: string
  options: string[]
  refInput: React.RefObject<HTMLInputElement>
  refCloseButton: React.RefObject<HTMLButtonElement>
  refInputContainer: React.RefObject<HTMLDivElement>

  style: React.CSSProperties
  dispatch: React.Dispatch<Action>
  state: State
}

export type Action =
  | { type: "QUERY:SET"; query: string }
  | { type: "QUERY:CLEAR" }
  | { type: "POPOVER:TOGGLE"; isOpening: boolean }
  | { type: "POPOVER:OPEN" }
  | { type: "POPOVER:CLOSE" }
  | { type: "ITEM:TOGGLE-SELECTED"; backwards?: boolean }
  | { type: "ITEM:SELECT"; index: number | null }
  | { type: "this:UPDATE-DEPENDENCY"; deps: Partial<State> }

export type State = {
  isPopoverExpanded: boolean
  options: string[]
  initialOptions: string[]
  query: string
  emptyOptions: boolean
  selectedSomething: boolean
  selectedIndex: number | null
  selectedItem: string | null
}

export const AutocompleteContext = React.createContext<AutocompleteContextValue>(
  {} as AutocompleteContextValue
)

type AutocompleteRootProps = React.PropsWithChildren & {
  options: string[]
  onSelectItem?: (item: string) => void
}

export const AutocompleteRoot = React.forwardRef<
  React.ElementRef<"div">,
  AutocompleteRootProps
>(function AutocompleteRootComponent({ onSelectItem, options, children, ...props }, ref) {
  const [contextId] = useState(() => Math.random().toString(36).slice(2))
  const refInputContainer = React.useRef<HTMLDivElement>(null)
  const refInput = React.useRef<HTMLInputElement>(null)
  const refCloseButton = React.useRef<HTMLButtonElement>(null)
  const initialState: State = {
    isPopoverExpanded: false,
    options,
    initialOptions: options,
    query: "",
    emptyOptions: false,
    selectedSomething: false,
    selectedIndex: null,
    selectedItem: null,
  }

  const [state, dispatch] = React.useReducer<React.Reducer<State, Action>>(
    (prevState, action) => {
      let state = { ...prevState }

      // Derivações pré `action`

      switch (action.type) {
        case "this:UPDATE-DEPENDENCY":
          state = {
            ...state,
            ...action.deps,
          }
          break
        case "QUERY:SET":
          state.query = action.query
          break
        case "QUERY:CLEAR":
          setTimeout(() => refInput.current?.focus())
          state.isPopoverExpanded = true
          state.query = ""
          break
        case "POPOVER:CLOSE":
          state.isPopoverExpanded = false
          break
        case "POPOVER:OPEN":
          state.isPopoverExpanded = true
          break
        case "POPOVER:TOGGLE":
          state.isPopoverExpanded = action.isOpening
          break
        case "ITEM:SELECT":
          const idx = action.index ?? state.selectedIndex ?? 0
          state.query = state.options[idx]
          state.isPopoverExpanded = false
          onSelectItem?.(state.options[idx])
          break
        case "ITEM:TOGGLE-SELECTED":
          if (!action.backwards && state.selectedIndex === state.options.length - 1) {
            state.selectedIndex = 0
          } else if (action.backwards && state.selectedIndex === 0) {
            state.selectedIndex = state.options.length - 1
          } else {
            if (state.selectedIndex !== null) {
              if (action.backwards) state.selectedIndex--
              else state.selectedIndex++
            } else {
              state.selectedIndex = 0
            }
          }
          break
      }

      // Derivações pré `render`
      const diff = createDiff(prevState, state)

      if (diff([s => s.query, s => s.initialOptions])) {
        state.options = state.initialOptions.filter(tag =>
          tag.toLowerCase().trim().includes(state.query.toLowerCase().trim())
        )
      }
      state.emptyOptions = state.options.length === 0
      if (state.isPopoverExpanded === false) state.selectedIndex = null
      if (prevState.options.length !== state.options.length) state.selectedIndex = 0
      state.selectedSomething = state.selectedIndex !== null

      // Debug
      const [hasChanges, changes] = extractChanges(prevState, state)
      if (!hasChanges) return prevState
      return state
    },
    initialState
  )

  React.useEffect(() => {
    dispatch({ type: "this:UPDATE-DEPENDENCY", deps: { initialOptions: options } })
  }, [options])

  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (isRefElementClicked(e, refCloseButton)) return

      if (e.key === "Escape") {
        dispatch({ type: "POPOVER:CLOSE" })
      }
      if (e.key === "Tab") {
        dispatch({ type: "ITEM:TOGGLE-SELECTED", backwards: e.shiftKey })
      }
      if (e.key === "ArrowDown") {
        dispatch({ type: "ITEM:TOGGLE-SELECTED" })
      }
      if (e.key === "ArrowUp") {
        dispatch({ type: "ITEM:TOGGLE-SELECTED", backwards: true })
      }
      if (e.key === "Enter") {
        dispatch({ type: "ITEM:SELECT", index: state.selectedIndex })
      }
    }

    function onClickOutside(e: MouseEvent) {
      if (
        refInputContainer.current &&
        !refInputContainer.current.contains(e.target as Node)
      ) {
        dispatch({ type: "POPOVER:CLOSE" })
      }
    }

    document.addEventListener("keydown", handler)
    document.addEventListener("click", onClickOutside)
    return () => {
      document.removeEventListener("keydown", handler)
      document.removeEventListener("click", onClickOutside)
    }
  }, [])

  const style: React.CSSProperties = {
    transform: `translate(${refInputContainer.current?.getBoundingClientRect().left}px, ${(refInputContainer.current?.getBoundingClientRect().bottom ?? 0) + 8}px)`,
    width: refInputContainer.current
      ? refInputContainer.current?.clientWidth + 2 + "px"
      : "50vw",
  }

  return (
    <AutocompleteContext.Provider
      value={{
        contextId,
        options,
        state,
        style,
        refInput,
        refInputContainer,
        refCloseButton,
        dispatch,
      }}
    >
      {children}
    </AutocompleteContext.Provider>
  )
})

export type AutocompleteContainerProps = React.ComponentPropsWithoutRef<"div">

export const AutocompleteContainer = React.forwardRef<
  React.ElementRef<"div">,
  AutocompleteContainerProps
>(function AutocompleteContainerComponent({ className, ...props }, __ref) {
  const { refInputContainer } = React.useContext(AutocompleteContext)
  const ref = mergeRefs(__ref, refInputContainer)
  return (
    <div
      ref={ref}
      className={cn("flex h-9", Input_borderCls, "focus-within:border-sky-500")}
      {...props}
    />
  )
})

export type AutocompleteInputProps = React.ComponentPropsWithoutRef<typeof Input>

export const AutocompleteInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  AutocompleteInputProps
>(function AutocompleteInputComponent({ className, ...props }, __ref) {
  const { dispatch, refInput, state, refInputContainer, refCloseButton } =
    React.useContext(AutocompleteContext)
  const ref = mergeRefs(__ref, refInput)

  return (
    <Input
      ref={ref}
      className={cn("", className)}
      {...props}
      facade={props.facade ?? true}
      value={props.value ?? state.query}
      onChange={e => {
        dispatch({ type: "QUERY:SET", query: e.target.value })
        props.onChange?.(e)
      }}
      onFocus={e => {
        if (!isRefElementClicked(e, refCloseButton)) {
          dispatch({ type: "POPOVER:OPEN" })
        }
        props.onFocus?.(e)
      }}
      onKeyDown={e => {
        if (e.key === "Tab" && state.isPopoverExpanded && !state.emptyOptions) {
          e.preventDefault()
        }
        props.onKeyDown?.(e)
      }}
      onClick={e => {
        dispatch({ type: "POPOVER:OPEN" })
        props.onClick?.(e)
      }}
      placeholder={props.placeholder ?? "Procure algum tópico..."}
    />
  )
})

export type AutocompleteClosePopoverProps = React.ComponentPropsWithoutRef<"button"> & {
  asChild?: boolean
}

export const AutocompleteClosePopover = React.forwardRef<
  React.ElementRef<"button">,
  AutocompleteClosePopoverProps
>(function AutocompleteClosePopoverComponent({ className, ...props }, __ref) {
  const { refCloseButton, dispatch } = React.useContext(AutocompleteContext)
  const ref = mergeRefs(refCloseButton, __ref)
  const Element = props.asChild ? Slot : "button"
  return (
    <Element
      ref={ref}
      {...props}
      onClick={e => {
        dispatch({ type: "QUERY:CLEAR" })
        props.onClick?.(e)
      }}
    />
  )
})

type AutocompleteOptionsPopoverProps = {}

export function AutocompleteOptionsPopover({}: AutocompleteOptionsPopoverProps) {
  const { state, style, dispatch, contextId } = React.useContext(AutocompleteContext)
  if (!state.isPopoverExpanded) return null

  return ReactDOM.createPortal(
    <div
      role="combobox"
      className="absolute left-0 top-0 z-50 w-72 border bg-white text-popover-foreground outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
      style={style}
    >
      <div id={contextId} />
      {!state.emptyOptions &&
        state.options.map((tag, index) => (
          <Button
            tabIndex={-1}
            variant="ghost"
            key={tag}
            className={cn(
              "flex w-full items-center justify-start gap-2 px-4 py-2",
              index === state.selectedIndex && "bg-neutral-100"
            )}
            onClick={() => {
              dispatch({ type: "ITEM:SELECT", index })
            }}
          >
            <span className="text-sm font-medium text-neutral-500">{tag}</span>
          </Button>
        ))}
    </div>,
    document.querySelector("#portal")!
  )
}

type AutocompleteOnNotFoundProps = React.PropsWithChildren

export function AutocompleteOnNotFound({ children }: AutocompleteOnNotFoundProps) {
  const { state, contextId } = React.useContext(AutocompleteContext)

  if (!state.emptyOptions) return null

  return ReactDOM.createPortal(children, document.getElementById(contextId)!)
}

export const Autocomplete = {
  Root: AutocompleteRoot,
  Container: AutocompleteContainer,
  Input: AutocompleteInput,
  ClosePopover: AutocompleteClosePopover,
  OptionsPopover: AutocompleteOptionsPopover,
  OnNotFound: AutocompleteOnNotFound,
}
