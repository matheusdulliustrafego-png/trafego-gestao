"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseDateOnly } from "@/lib/format";

export async function createTarefa(clienteId: string, formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const dataLimiteRaw = String(formData.get("dataLimite") ?? "").trim();

  if (!titulo) throw new Error("Título é obrigatório.");

  await prisma.tarefa.create({
    data: {
      titulo,
      clienteId: clienteId || null,
      dataLimite: dataLimiteRaw ? parseDateOnly(dataLimiteRaw) : null,
    },
  });

  if (clienteId) revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/");
}

export async function toggleTarefa(tarefaId: string, concluida: boolean) {
  await prisma.tarefa.update({
    where: { id: tarefaId },
    data: { concluida },
  });

  revalidatePath("/clientes/[id]", "page");
  revalidatePath("/");
}

export async function deleteTarefa(tarefaId: string) {
  await prisma.tarefa.delete({ where: { id: tarefaId } });
  revalidatePath("/clientes/[id]", "page");
  revalidatePath("/");
}
