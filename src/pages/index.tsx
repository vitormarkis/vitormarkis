import React from "react"
import { Tag } from "~/components/tag"
import { Input } from "~/components/ui/input"
import slugify from "slugify"
import { Section } from "~/components/section"
import { Autocomplete } from "~/components/ui/autocomplete"

const tags = ["Design Patterns", "React", "Web", "Boas Práticas"]

export default function Home() {
  return (
    <div className="h-screen bg-white">
      <Section>
        <div className="p-10">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold">Busque por um tópico</h1>
            <Autocomplete
              className="min-w-[70vw]"
              placeholder="Procure algum tópico..."
            />
          </div>
          {/* <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Tag
                key={tag}
                className="w-fit cursor-default border-y border-b-sky-600 border-t-sky-400 bg-sky-500 px-2 py-1 text-sm/none font-semibold text-white transition-colors hover:bg-sky-400"
                onClick={() => setQuery(tag)}
              >
                {tag}
              </Tag>
            ))}
          </div> */}
        </div>
      </Section>
    </div>
  )
}
