import { Shell } from "@/components/shells/shell"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <Shell>
      <section className="container flex flex-col items-center justify-center gap-8 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h1 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            404 - Language Not Found
          </h1>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            The language you requested is not supported or does not exist.
          </p>
          <Button asChild>
            <Link href="/how-it-works">
              Go to Supported Languages
            </Link>
          </Button>
        </div>
      </section>
    </Shell>
  )
}
