import { createSupabaseServerClient } from "@/src/lib/supabase-server-auth";

export default async function PruebaSesionPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-zinc-100 p-6">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">
          Prueba de sesión
        </h1>

        {user ? (
          <div className="mt-4">
            <p className="font-medium text-green-600">
              ✅ Usuario detectado
            </p>

            <p className="mt-2">
              Correo: {user.email}
            </p>

            <p className="mt-2 break-all text-sm text-zinc-500">
              UID: {user.id}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-red-600">
            ❌ No hay una sesión detectada.
          </p>
        )}
      </div>
    </main>
  );
}
