"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createEnrollmentLiabilityDraft,
  generateEnrollmentLiabilityPdf,
  updateEnrollmentLiabilityDraft,
} from "@/actions/enrollment-liability-forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EnrollmentLiabilityDraftInput } from "@/lib/documents/templates/enrollment-liability-form/v1/schema";
import { routeMatriculaTermo } from "@/lib/routes";

const emptyAddress = {
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  state: "",
  zip: "",
};

type Props = {
  studentId: string;
  studentName: string;
  isMinor: boolean;
  documentId?: string;
  initialDraft?: EnrollmentLiabilityDraftInput | null;
};

export function EnrollmentLiabilityFormEditor({
  studentId,
  studentName,
  isMinor,
  documentId,
  initialDraft,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [signaturePlace, setSignaturePlace] = useState(
    initialDraft?.signaturePlace ?? "",
  );
  const [studentRg, setStudentRg] = useState(initialDraft?.studentRg ?? "");
  const [studentAddress, setStudentAddress] = useState(
    initialDraft?.studentAddress ?? { ...emptyAddress },
  );
  const [hasDisability, setHasDisability] = useState<string>(
    initialDraft?.health.hasDisability === true
      ? "yes"
      : initialDraft?.health.hasDisability === false
        ? "no"
        : "",
  );
  const [usesMedication, setUsesMedication] = useState<string>(
    initialDraft?.health.usesMedication === true
      ? "yes"
      : initialDraft?.health.usesMedication === false
        ? "no"
        : "",
  );
  const [medicationDetails, setMedicationDetails] = useState(
    initialDraft?.health.medicationDetails ?? "",
  );
  const [lastPhysicalExamDate, setLastPhysicalExamDate] = useState(
    initialDraft?.health.lastPhysicalExamDate ?? "",
  );
  const [medicalConditions, setMedicalConditions] = useState(
    initialDraft?.health.medicalConditions ?? "",
  );
  const [guardian, setGuardian] = useState(() => ({
    fullName: initialDraft?.guardian?.fullName ?? "",
    rg: initialDraft?.guardian?.rg ?? "",
    cpf: initialDraft?.guardian?.cpf ?? "",
    phone: initialDraft?.guardian?.phone ?? "",
    municipality: initialDraft?.guardian?.municipality ?? "",
    state: initialDraft?.guardian?.state ?? "",
    address: initialDraft?.guardian?.address ?? { ...emptyAddress },
  }));

  const draftPayload = useMemo((): EnrollmentLiabilityDraftInput => {
    const boolOrNull = (v: string) =>
      v === "yes" ? true : v === "no" ? false : null;
    return {
      studentId,
      signaturePlace: signaturePlace.trim(),
      studentRg: studentRg.trim() || null,
      studentAddress: {
        street: studentAddress.street.trim(),
        number: studentAddress.number.trim(),
        neighborhood: studentAddress.neighborhood.trim(),
        city: studentAddress.city.trim(),
        state: studentAddress.state.trim(),
        zip: studentAddress.zip.trim(),
      },
      health: {
        hasDisability: boolOrNull(hasDisability),
        usesMedication: boolOrNull(usesMedication),
        medicationDetails: medicationDetails.trim() || null,
        lastPhysicalExamDate: lastPhysicalExamDate.trim() || null,
        medicalConditions: medicalConditions.trim() || null,
      },
      guardian: isMinor
        ? {
            fullName: guardian.fullName.trim(),
            rg: guardian.rg?.trim() || null,
            cpf: guardian.cpf?.trim() || null,
            phone: guardian.phone?.trim() || null,
            municipality: guardian.municipality?.trim() || null,
            state: guardian.state?.trim() || null,
            address: {
              street: guardian.address.street.trim(),
              number: guardian.address.number.trim(),
              neighborhood: guardian.address.neighborhood.trim(),
              city: guardian.address.city.trim(),
              state: guardian.address.state.trim(),
              zip: guardian.address.zip.trim(),
            },
          }
        : null,
    };
  }, [
    studentId,
    signaturePlace,
    studentRg,
    studentAddress,
    hasDisability,
    usesMedication,
    medicationDetails,
    lastPhysicalExamDate,
    medicalConditions,
    guardian,
    isMinor,
  ]);

  function saveDraft(thenGenerate: boolean) {
    startTransition(async () => {
      let id = documentId;
      if (id) {
        const r = await updateEnrollmentLiabilityDraft({
          documentId: id,
          draft: draftPayload,
        });
        if (!r.ok) {
          toast.error(r.error);
          return;
        }
      } else {
        const r = await createEnrollmentLiabilityDraft(draftPayload);
        if (!r.ok) {
          toast.error(r.error);
          return;
        }
        id = r.documentId;
      }

      if (!thenGenerate) {
        toast.success("Rascunho guardado.");
        router.push(routeMatriculaTermo(id!));
        router.refresh();
        return;
      }

      const gen = await generateEnrollmentLiabilityPdf({ documentId: id! });
      if (!gen.ok) {
        toast.error(gen.error);
        router.push(routeMatriculaTermo(id!));
        return;
      }
      toast.success(`PDF ${gen.number} gerado.`);
      router.push(routeMatriculaTermo(id!));
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Aluno</h2>
        <p className="text-crm-sm text-muted-foreground">
          {studentName} · {isMinor ? "Formulário de menor" : "Formulário de adulto"}
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="font-medium">Dados do praticante</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="signaturePlace">Cidade da assinatura</Label>
            <Input
              id="signaturePlace"
              value={signaturePlace}
              onChange={(e) => setSignaturePlace(e.target.value)}
              placeholder="Ex.: São Paulo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentRg">RG do aluno</Label>
            <Input
              id="studentRg"
              value={studentRg}
              onChange={(e) => setStudentRg(e.target.value)}
            />
          </div>
        </div>
        <AddressFields
          title="Endereço do aluno"
          value={studentAddress}
          onChange={setStudentAddress}
        />
      </section>

      <section className="space-y-4">
        <h3 className="font-medium">Saúde</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <BoolSelect
            label="Portador de deficiência"
            value={hasDisability}
            onChange={setHasDisability}
          />
          <BoolSelect
            label="Usa medicamento"
            value={usesMedication}
            onChange={setUsesMedication}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="medicationDetails">Qual medicamento</Label>
          <Input
            id="medicationDetails"
            value={medicationDetails}
            onChange={(e) => setMedicationDetails(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lastPhysicalExamDate">Último exame físico</Label>
            <Input
              id="lastPhysicalExamDate"
              type="date"
              value={lastPhysicalExamDate}
              onChange={(e) => setLastPhysicalExamDate(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="medicalConditions">Condições médicas adicionais</Label>
          <Textarea
            id="medicalConditions"
            value={medicalConditions}
            onChange={(e) => setMedicalConditions(e.target.value)}
            rows={3}
          />
        </div>
      </section>

      {isMinor ? (
        <section className="space-y-4">
          <h3 className="font-medium">Responsável legal</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="guardianName">Nome completo</Label>
              <Input
                id="guardianName"
                value={guardian.fullName}
                onChange={(e) =>
                  setGuardian((g) => ({ ...g, fullName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianRg">RG</Label>
              <Input
                id="guardianRg"
                value={guardian.rg}
                onChange={(e) => setGuardian((g) => ({ ...g, rg: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianCpf">CPF</Label>
              <Input
                id="guardianCpf"
                value={guardian.cpf}
                onChange={(e) => setGuardian((g) => ({ ...g, cpf: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianPhone">Telefone (WhatsApp)</Label>
              <Input
                id="guardianPhone"
                value={guardian.phone}
                onChange={(e) =>
                  setGuardian((g) => ({ ...g, phone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianMunicipality">Município</Label>
              <Input
                id="guardianMunicipality"
                value={guardian.municipality}
                onChange={(e) =>
                  setGuardian((g) => ({ ...g, municipality: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianState">Estado (UF)</Label>
              <Input
                id="guardianState"
                value={guardian.state}
                maxLength={2}
                onChange={(e) =>
                  setGuardian((g) => ({ ...g, state: e.target.value.toUpperCase() }))
                }
              />
            </div>
          </div>
          <AddressFields
            title="Endereço do responsável"
            value={guardian.address}
            onChange={(addr) => setGuardian((g) => ({ ...g, address: addr }))}
          />
        </section>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          className="min-h-11"
          onClick={() => saveDraft(false)}
        >
          Guardar rascunho
        </Button>
        <Button
          type="button"
          disabled={pending}
          className="min-h-11"
          onClick={() => saveDraft(true)}
        >
          Gerar PDF
        </Button>
      </div>
    </div>
  );
}

function BoolSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="min-h-11">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="yes">Sim</SelectItem>
          <SelectItem value="no">Não</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function AddressFields({
  title,
  value,
  onChange,
}: {
  title: string;
  value: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
  };
  onChange: (v: typeof value) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <p className="text-crm-sm font-medium">{title}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Logradouro</Label>
          <Input
            value={value.street}
            onChange={(e) => onChange({ ...value, street: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Número</Label>
          <Input
            value={value.number}
            onChange={(e) => onChange({ ...value, number: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Bairro</Label>
          <Input
            value={value.neighborhood}
            onChange={(e) => onChange({ ...value, neighborhood: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Cidade</Label>
          <Input
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>UF</Label>
          <Input
            value={value.state}
            maxLength={2}
            onChange={(e) =>
              onChange({ ...value, state: e.target.value.toUpperCase() })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>CEP</Label>
          <Input
            value={value.zip}
            onChange={(e) => onChange({ ...value, zip: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
