import { RabbitIcon } from "lucide-react"
import { Section } from "~/components/section"
import { Autocomplete } from "~/components/ui/autocomplete"

export default function Home() {
  return (
    <div className="h-screen bg-white">
      <Section>
        <div className="p-10">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold">Busque por um tópico</h1>
            <Autocomplete.Root
              onSelectItem={console.log}
              options={["Design Patterns", "React", "Observer", "Web", "Boas Práticas"]}
            >
              <Autocomplete.Input placeholder="Procure algum tópico..." />
              <Autocomplete.ClosePopover />
              <Autocomplete.OptionsPopover />
              <Autocomplete.OnNotFound>
                <div className="flex justify-center gap-2 px-4 py-4 text-sm font-medium text-neutral-500">
                  <RabbitIcon />
                  <p>No tags found with this query :/</p>
                </div>
              </Autocomplete.OnNotFound>
            </Autocomplete.Root>
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
