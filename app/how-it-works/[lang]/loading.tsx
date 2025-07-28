import { Shell } from "@/components/shells/shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function HowItWorksLoading() {
  return (
    <Shell>
      <section className="container flex flex-col gap-8 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <div className="flex gap-2 justify-center mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-12" />
            ))}
          </div>
          <Skeleton className="h-14 w-[250px] sm:w-[300px] md:h-24 md:w-[500px]" />
          <Skeleton className="h-4 w-[150px] sm:w-[250px] md:w-[350px]" />
        </div>

        {/* How It Works Section Skeleton */}
        <div className="mx-auto max-w-[58rem] mt-12">
          <Skeleton className="h-8 w-[200px] mx-auto mb-8" />
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
                <Skeleton className="h-8 w-8 rounded-full mb-4" />
                <Skeleton className="h-6 w-[120px] mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section Skeleton */}
        <div className="mx-auto max-w-[58rem] mt-16">
          <Skeleton className="h-8 w-[100px] mx-auto mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  )
}
