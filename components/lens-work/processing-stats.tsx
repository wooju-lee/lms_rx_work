import { Clock } from "lucide-react"

interface LabStatCard {
  count: number
  name: string
  description: string
}

const statsData: LabStatCard[] = [
  { count: 7, name: "(Basic) IIC Lab", description: "Standard processing 7 ~ 10 D" },
  { count: 5, name: "(Basic) Lab 1", description: "Additional time 10 ~ 14 D" },
  { count: 3, name: "(Basic) Lab 2", description: "Additional time 12 ~ 16 D" },
  { count: 9, name: "(Tint) IIC Lab", description: "Standard processing 9 ~ 12 D" },
  { count: 4, name: "(Tint) Lab 1", description: "Standard processing 12 ~ 16 D" },
  { count: 2, name: "(Tint) Lab 2", description: "Standard processing 14 ~ 18 D" },
]

export function ProcessingStats() {
  return (
    <div className="bg-muted/30 rounded-lg border border-border p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Work Status</span>
          <span className="ml-1">(View order quantity statistics by processing period based on the list.)</span>
        </h3>
      </div>

      {/* Stats Cards - Horizontal Layout */}
      <div className="grid grid-cols-6 gap-3">
        {statsData.map((stat) => (
          <div
            key={stat.name}
            className="bg-card rounded-lg border border-border p-4"
          >
            <div className="flex items-start gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-2xl font-bold text-foreground">{stat.count}</div>
                <div className="text-sm font-medium text-foreground mt-1">{stat.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
