import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { formatDate, formatDateTime, formatPhone, formatCurrency } from '@/lib/format';
import {
  APPOINTMENT_STATUS, APPOINTMENT_STATUS_COLORS,
  CONSULTATION_STATUS, LAB_STATUS, LAB_STATUS_COLORS,
  INVOICE_STATUS, INVOICE_STATUS_COLORS, HOSP_STATUS, HOSP_STATUS_COLORS,
} from '@/lib/constants';
import {
  ArrowLeft, Phone, Mail, MapPin, CalendarDays, Droplet, AlertTriangle,
  ClipboardList, Activity, FileText, Pill, Stethoscope,
} from 'lucide-react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  bloodGroup?: string;
  allergies?: string;
  chronicConditions?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState('appointments');

  const { data: patient, isLoading } = useQuery<Patient>({
    queryKey: ['patient', id],
    queryFn: () => fetch(`/api/patients/${id}`).then((r) => r.json()),
  });

  const { data: appointments } = useQuery({
    queryKey: ['patient', id, 'appointments'],
    queryFn: () => fetch(`/api/patients/${id}/appointments`).then((r) => r.json()).then((d) => d.data || d.appointments || []),
    enabled: tab === 'appointments',
  });

  const { data: consultations } = useQuery({
    queryKey: ['patient', id, 'consultations'],
    queryFn: () => fetch(`/api/patients/${id}/consultations`).then((r) => r.json()).then((d) => d.data || d.consultations || []),
    enabled: tab === 'consultations',
  });

  const { data: prescriptions } = useQuery({
    queryKey: ['patient', id, 'prescriptions'],
    queryFn: () => fetch(`/api/patients/${id}/prescriptions`).then((r) => r.json()).then((d) => d.data || d.prescriptions || []),
    enabled: tab === 'prescriptions',
  });

  const { data: labResults } = useQuery({
    queryKey: ['patient', id, 'lab-results'],
    queryFn: () => fetch(`/api/patients/${id}/lab-requests`).then((r) => r.json()).then((d) => d.data || d.labRequests || []),
    enabled: tab === 'lab',
  });

  const { data: invoices } = useQuery({
    queryKey: ['patient', id, 'invoices'],
    queryFn: () => fetch(`/api/patients/${id}/invoices`).then((r) => r.json()).then((d) => d.data || d.invoices || []),
    enabled: tab === 'invoices',
  });

  const { data: hospitalizations } = useQuery({
    queryKey: ['patient', id, 'hospitalizations'],
    queryFn: () => fetch(`/api/patients/${id}/hospitalizations`).then((r) => r.json()).then((d) => d.data || d.hospitalizations || []),
    enabled: tab === 'hospitalizations',
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Patient introuvable</p>
        <Link to="/patients" className="text-primary-600 hover:underline mt-2 inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-gray-500">Dossier patient</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 text-primary-700 font-bold text-2xl">
                {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{formatPhone(patient.phone)}</span>
              </div>
              {patient.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{patient.email}</span>
                </div>
              )}
              {patient.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{patient.address}{patient.city ? `, ${patient.city}` : ''}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <span>Né(e) le {formatDate(patient.dateOfBirth)}</span>
              </div>
              {patient.bloodGroup && (
                <div className="flex items-center gap-2 text-sm">
                  <Droplet className="h-4 w-4 text-gray-400" />
                  <Badge variant="secondary">{patient.bloodGroup}</Badge>
                </div>
              )}
            </div>

            {patient.allergies && (
              <div className="rounded-lg bg-red-50 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  Allergies
                </div>
                <p className="text-sm text-red-600 mt-1">{patient.allergies}</p>
              </div>
            )}

            {patient.chronicConditions && (
              <div className="rounded-lg bg-yellow-50 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-yellow-700">
                  <Activity className="h-4 w-4" />
                  Antécédents
                </div>
                <p className="text-sm text-yellow-600 mt-1">{patient.chronicConditions}</p>
              </div>
            )}

            {patient.emergencyContact && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Contact d'urgence</p>
                <p className="text-sm font-medium">{patient.emergencyContact}</p>
                {patient.emergencyPhone && <p className="text-sm text-gray-500">{formatPhone(patient.emergencyPhone)}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="lg:col-span-2">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full overflow-x-auto flex-nowrap">
              <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
              <TabsTrigger value="consultations">Consultations</TabsTrigger>
              <TabsTrigger value="prescriptions">Ordonnances</TabsTrigger>
              <TabsTrigger value="lab">Laboratoire</TabsTrigger>
              <TabsTrigger value="invoices">Factures</TabsTrigger>
              <TabsTrigger value="hospitalizations">Hospitalisations</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments">
              <Card>
                <CardContent className="pt-6">
                  {!appointments?.length ? (
                    <p className="text-center text-gray-500 py-8">Aucun rendez-vous</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Horaire</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Médecin</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.map((a: any) => (
                          <TableRow key={a.id}>
                            <TableCell>{formatDate(a.date)}</TableCell>
                            <TableCell>{a.startTime} - {a.endTime}</TableCell>
                            <TableCell>{a.type}</TableCell>
                            <TableCell>{a.staff?.firstName} {a.staff?.lastName}</TableCell>
                            <TableCell>
                              <Badge className={APPOINTMENT_STATUS_COLORS[a.status]}>{APPOINTMENT_STATUS[a.status]}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consultations">
              <Card>
                <CardContent className="pt-6">
                  {!consultations?.length ? (
                    <p className="text-center text-gray-500 py-8">Aucune consultation</p>
                  ) : (
                    <div className="space-y-4">
                      {consultations.map((c: any) => (
                        <div key={c.id} className="p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{formatDateTime(c.date)}</span>
                            <Badge>{CONSULTATION_STATUS[c.status] || c.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600"><strong>Médecin:</strong> {c.staff?.firstName} {c.staff?.lastName}</p>
                          {c.symptoms && <p className="text-sm text-gray-600"><strong>Symptômes:</strong> {c.symptoms}</p>}
                          {c.diagnosis && <p className="text-sm text-gray-600"><strong>Diagnostic:</strong> {c.diagnosis}</p>}
                          {c.treatment && <p className="text-sm text-gray-600"><strong>Traitement:</strong> {c.treatment}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescriptions">
              <Card>
                <CardContent className="pt-6">
                  {!prescriptions?.length ? (
                    <p className="text-center text-gray-500 py-8">Aucune ordonnance</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Médicament</TableHead>
                          <TableHead>Posologie</TableHead>
                          <TableHead>Durée</TableHead>
                          <TableHead>Délivré</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prescriptions.map((p: any) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Pill className="h-4 w-4 text-primary-500" />
                                {p.medication?.name || '—'}
                              </div>
                            </TableCell>
                            <TableCell>{p.dosage} — {p.frequency}</TableCell>
                            <TableCell>{p.duration}</TableCell>
                            <TableCell>
                              <Badge variant={p.isDispensed ? 'success' : 'secondary'}>
                                {p.isDispensed ? 'Délivré' : 'En attente'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lab">
              <Card>
                <CardContent className="pt-6">
                  {!labResults?.length ? (
                    <p className="text-center text-gray-500 py-8">Aucun résultat de laboratoire</p>
                  ) : (
                    <div className="space-y-4">
                      {labResults.map((lr: any) => (
                        <div key={lr.id} className="p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{lr.testType}</span>
                            <Badge className={LAB_STATUS_COLORS[lr.status]}>{LAB_STATUS[lr.status]}</Badge>
                          </div>
                          <p className="text-xs text-gray-500">Demandé le {formatDateTime(lr.requestedAt)}</p>
                          {lr.results?.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {lr.results.map((r: any) => (
                                <div key={r.id} className="flex justify-between text-sm">
                                  <span>{r.parameter}</span>
                                  <span className={r.isAbnormal ? 'text-red-600 font-semibold' : ''}>
                                    {r.value} {r.unit}
                                    {r.normalMin && r.normalMax && (
                                      <span className="text-gray-400 text-xs ml-1">
                                        ({r.normalMin}-{r.normalMax})
                                      </span>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices">
              <Card>
                <CardContent className="pt-6">
                  {!invoices?.length ? (
                    <p className="text-center text-gray-500 py-8">Aucune facture</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>N° Facture</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Payé</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((inv: any) => (
                          <TableRow key={inv.id}>
                            <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                            <TableCell>{formatDate(inv.issuedAt)}</TableCell>
                            <TableCell>{formatCurrency(inv.totalAmount)}</TableCell>
                            <TableCell>{formatCurrency(inv.paidAmount)}</TableCell>
                            <TableCell>
                              <Badge className={INVOICE_STATUS_COLORS[inv.status]}>{INVOICE_STATUS[inv.status]}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hospitalizations">
              <Card>
                <CardContent className="pt-6">
                  {!hospitalizations?.length ? (
                    <p className="text-center text-gray-500 py-8">Aucune hospitalisation</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Admission</TableHead>
                          <TableHead>Sortie</TableHead>
                          <TableHead>Motif</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hospitalizations.map((h: any) => (
                          <TableRow key={h.id}>
                            <TableCell>{formatDateTime(h.admissionDate)}</TableCell>
                            <TableCell>{h.dischargeDate ? formatDateTime(h.dischargeDate) : '—'}</TableCell>
                            <TableCell className="max-w-xs truncate">{h.reason}</TableCell>
                            <TableCell>
                              <Badge className={HOSP_STATUS_COLORS[h.status]}>{HOSP_STATUS[h.status]}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
