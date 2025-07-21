import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Database, RefreshCw } from "lucide-react"
import Link from "next/link"

type Note = {
  id: number
  title: string
  content: string | null
  created_at: string
  updated_at: string
}

export default async function NotesPage() {
  const supabase = await createClient()

  const { data: notes, error } = await supabase.from("notes").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Błąd pobierania notes:", error)
    return (
      <div className="container mx-auto p-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Database className="w-6 h-6" />
              Błąd połączenia z bazą danych
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Wystąpił błąd podczas pobierania danych: {error.message}</p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Kod błędu:</strong> {error.code}
              </p>
              <p>
                <strong>Szczegóły:</strong> {error.details}
              </p>
              <p>
                <strong>Wskazówka:</strong> {error.hint}
              </p>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium">Szczegóły błędu (JSON)</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">{JSON.stringify(error, null, 2)}</pre>
            </details>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Możliwe rozwiązania:</p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Sprawdź zmienne środowiskowe w .env.development.local</li>
                <li>Uruchom migrację SQL w Supabase Studio</li>
                <li>Zweryfikuj połączenie z bazą danych</li>
                <li>Sprawdź czy RLS policies są poprawnie skonfigurowane</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Database className="w-8 h-8 text-blue-600" />
                Notes from Supabase
              </h1>
              <p className="text-gray-600">Dane pobrane z bazy danych Supabase dla projektu MotoAuto.ch</p>
            </div>
            <Link
              href="/notes"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Odśwież
            </Link>
          </div>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline">Połączono z: hqygljpxjpzcrxojftbh.supabase.co</Badge>
            <Badge variant="secondary">Region: EU Central</Badge>
            <Badge variant="default">{notes?.length || 0} rekordów</Badge>
          </div>
        </div>

        {/* Notes Grid */}
        {!notes || notes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Brak notatek w bazie danych</h3>
              <p className="text-gray-500 mb-4">Tabela notes jest pusta lub nie została jeszcze utworzona.</p>
              <div className="bg-gray-50 p-4 rounded-lg text-left">
                <p className="text-sm font-medium text-gray-700 mb-2">Aby dodać przykładowe dane:</p>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Otwórz Supabase Studio</li>
                  <li>Przejdź do SQL Editor</li>
                  <li>Wklej kod z pliku: supabase/migrations/20250719_create_notes_table.sql</li>
                  <li>Uruchom migrację</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note: Note) => (
              <Card key={note.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(note.created_at).toLocaleDateString("pl-PL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {note.content && <p className="text-gray-700 text-sm line-clamp-3 mb-3">{note.content}</p>}
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="text-xs">
                      ID: {note.id}
                    </Badge>
                    {note.updated_at !== note.created_at && (
                      <Badge variant="outline" className="text-xs">
                        Zaktualizowano
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Status Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5" />
              Status połączenia Supabase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{notes?.length || 0}</div>
                <div className="text-sm text-green-700">Rekordów</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">✓</div>
                <div className="text-sm text-blue-700">Połączono</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">RLS</div>
                <div className="text-sm text-purple-700">Włączone</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">EU</div>
                <div className="text-sm text-orange-700">Region</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Projekt ID:</span>
                  <span className="font-mono text-xs">hqygljpxjpzcrxojftbh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">URL:</span>
                  <span className="font-mono text-xs">https://hqygljpxjpzcrxojftbh.supabase.co</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Baza danych:</span>
                  <span className="font-mono text-xs">PostgreSQL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ostatnie odświeżenie:</span>
                  <span className="text-xs">{new Date().toLocaleString("pl-PL")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Panel (tylko w development) */}
        {process.env.NODE_ENV === "development" && notes && notes.length > 0 && (
          <details className="mt-8">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium">
              🔧 Panel deweloperski - Raw JSON Data
            </summary>
            <Card className="mt-2">
              <CardContent className="p-4">
                <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded max-h-96">
                  {JSON.stringify(notes, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </details>
        )}

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            ← Powrót do strony głównej
          </Link>
        </div>
      </div>
    </div>
  )
}

// Metadata dla SEO
export const metadata = {
  title: "Notes - MotoAuto.ch",
  description: "Lista notatek z bazy danych Supabase dla platformy MotoAuto.ch",
}
