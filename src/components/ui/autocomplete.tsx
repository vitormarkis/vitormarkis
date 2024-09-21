import { RabbitIcon, XIcon } from "lucide-react"
import mergeRefs from "merge-refs"
import React, { CSSProperties, useEffect } from "react"
import ReactDOM from "react-dom"
import { Button } from "~/components/ui/button"
import { Input, Input_borderCls } from "~/components/ui/input"
import { cn } from "~/lib/utils"
import { isRefElementClicked } from "~/utils"

const tags = ["Design Patterns", "React", "Web", "Boas Práticas"]

export type AutocompleteProps = React.ComponentPropsWithoutRef<typeof Input>

export const Autocomplete = React.forwardRef<
  React.ElementRef<typeof Input>,
  AutocompleteProps
>(function AutocompleteComponent({ className, ...props }, __ref) {
  const refInputContainer = React.useRef<HTMLDivElement>(null)
  const refInput = React.useRef<HTMLInputElement>(null)
  const refCloseButton = React.useRef<HTMLButtonElement>(null)
  const mergedRefs = mergeRefs(refInputContainer, __ref)
  type Action =
    | { type: "QUERY:SET"; query: string }
    | { type: "QUERY:CLEAR" }
    | { type: "POPOVER:TOGGLE"; isOpening: boolean }
    | { type: "POPOVER:OPEN" }
    | { type: "POPOVER:CLOSE" }
    | { type: "TOGGLE-SELECTED"; backwards?: boolean }
    | { type: "SELECT-ITEM"; index: number | null }

  type State = {
    isPopoverExpanded: boolean
    tags: string[]
    initialTags: string[]
    query: string
    emptyTags: boolean
    selectedSomething: boolean
    selectedIndex: number | null
    selectedItem: string | null
  }

  const initialState: State = {
    isPopoverExpanded: false,
    tags,
    initialTags: tags,
    query: "",
    emptyTags: false,
    selectedSomething: false,
    selectedIndex: null,
    selectedItem: null,
  }

  function onSelectItem(item: string) {
    console.log(item)
  }

  const [state, dispatch] = React.useReducer<React.Reducer<State, Action>>(
    (prevState, action) => {
      const state = { ...prevState }

      // Derivações pré `action`

      switch (action.type) {
        case "QUERY:SET":
          state.query = action.query
          break
        case "QUERY:CLEAR":
          setTimeout(() => refInput.current?.focus())
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
        case "SELECT-ITEM":
          const idx = action.index ?? state.selectedIndex ?? 0
          state.query = state.tags[idx]
          state.isPopoverExpanded = false
          onSelectItem(state.tags[idx])
          break
        case "TOGGLE-SELECTED":
          if (!action.backwards && state.selectedIndex === state.tags.length - 1) {
            state.selectedIndex = 0
          } else if (action.backwards && state.selectedIndex === 0) {
            state.selectedIndex = state.tags.length - 1
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
      state.tags = state.initialTags.filter(tag =>
        tag.toLowerCase().trim().includes(state.query.toLowerCase().trim())
      )
      state.emptyTags = state.tags.length === 0
      if (state.isPopoverExpanded === false) state.selectedIndex = null
      if (prevState.tags.length !== state.tags.length) state.selectedIndex = 0
      state.selectedSomething = state.selectedIndex !== null
      return state
    },
    initialState
  )

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (isRefElementClicked(e, refCloseButton)) return

      if (e.key === "Escape") {
        dispatch({ type: "POPOVER:CLOSE" })
      }
      if (e.key === "Tab") {
        dispatch({ type: "TOGGLE-SELECTED", backwards: e.shiftKey })
      }
      if (e.key === "ArrowDown") {
        dispatch({ type: "TOGGLE-SELECTED" })
      }
      if (e.key === "ArrowUp") {
        dispatch({ type: "TOGGLE-SELECTED", backwards: true })
      }
      if (e.key === "Enter") {
        dispatch({ type: "SELECT-ITEM", index: state.selectedIndex })
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

  const style: CSSProperties = {
    transform: `translate(${refInputContainer.current?.getBoundingClientRect().left}px, ${(refInputContainer.current?.getBoundingClientRect().bottom ?? 0) + 8}px)`,
    width: refInputContainer.current
      ? refInputContainer.current?.clientWidth + 2 + "px"
      : "50vw",
  }

  return (
    <>
      <div
        ref={mergedRefs}
        className={cn("flex h-9", Input_borderCls, "focus-within:border-sky-500")}
      >
        <Input
          ref={refInput}
          facade
          value={state.query}
          onChange={e => dispatch({ type: "QUERY:SET", query: e.target.value })}
          onFocus={() => {
            dispatch({ type: "POPOVER:OPEN" })
            setTimeout(() => {
              refInputContainer.current?.focus()
            })
          }}
          onKeyDown={e => {
            if (e.key === "Tab" && state.isPopoverExpanded && !state.emptyTags) {
              e.preventDefault()
            }
          }}
          onClick={e => {
            dispatch({ type: "POPOVER:OPEN" })
          }}
          className={cn("", className)}
          placeholder="Procure algum tópico..."
          {...props}
        />
        <button
          ref={refCloseButton}
          onClick={() => {
            dispatch({ type: "QUERY:CLEAR" })
          }}
          className="grid aspect-square h-full place-items-center hover:bg-neutral-100"
        >
          <XIcon className="h-3 w-3" />
        </button>
      </div>
      {state.isPopoverExpanded
        ? ReactDOM.createPortal(
            <div
              role="combobox"
              className="absolute left-0 top-0 z-50 w-72 border bg-white text-popover-foreground outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              style={style}
            >
              {state.emptyTags ? (
                <div className="flex justify-center gap-2 px-4 py-4 text-sm font-medium text-neutral-500">
                  <RabbitIcon />
                  <p>No tags found with this query :/</p>
                </div>
              ) : (
                state.tags.map((tag, index) => (
                  <Button
                    tabIndex={-1}
                    variant="ghost"
                    key={tag}
                    className={cn(
                      "flex w-full items-center justify-start gap-2 px-4 py-2",
                      index === state.selectedIndex && "bg-neutral-100"
                    )}
                    onClick={() => {
                      dispatch({ type: "SELECT-ITEM", index })
                    }}
                  >
                    <span className="text-sm font-medium text-neutral-500">{tag}</span>
                  </Button>
                ))
              )}
            </div>,
            document.querySelector("#portal")!
          )
        : null}
    </>
  )
})

// <Popover
// open={state.isPopoverExpanded}
// onOpenChange={isOpening => {
// dispatch({ type: "POPOVER:TOGGLE", isOpening })
// }}
// >
// {/* <PopoverTrigger
// tabIndex={null}
// className="w-full"
// asChild
// onKeyDown={e => {
//   if (e.key === "Tab") {
//     if (state.isPopoverExpanded) {
//       e.preventDefault()
//     }
//   }
// }}
// > */}

// </PopoverTrigger>

// {/* <PopoverContent
// style={{
//   width: ref.current?.clientWidth ? ref.current?.clientWidth + 2 : "100%",
// }}
// >
// {state.emptyTags ? (
//   <div className="flex justify-center gap-2 px-4 py-4 text-sm font-medium text-neutral-500">
//     <RabbitIcon />
//     <p>No tags found with this query :/</p>
//   </div>
// ) : (
//   state.tags.map((tag, idx) => (
//     <Button
//       tabIndex={null}
//       variant="ghost"
//       key={tag}
//       className={cn(
//         "flex w-full items-center justify-start gap-2 px-4 py-2",
//         idx === state.selectedIndex && "bg-neutral-100"
//       )}
//       onClick={() => {
//         dispatch({ type: "SELECT-ITEM" })
//       }}
//     >
//       <span className="text-sm font-medium text-neutral-500">{tag}</span>
//     </Button>
//   ))
// )}
// </PopoverContent> */}
// // </Popover>
// )
