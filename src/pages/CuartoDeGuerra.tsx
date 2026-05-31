import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Plus, Trash2, UserPlus, Upload, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  UploadPdfDialog,
  getCuartoDeGuerraPdfs,
  downloadCuartoDeGuerraPdf,
  saveCuartoDeGuerraPdfs,
  CuartoDeGuerraPdf,
} from '@/components/cuarto-de-guerra/UploadPdfDialog';

interface CuartoDeGuerraReport {
  id: string;
  nombreEnsenanza: string;
  asistentes: string[];
  versiculoPrincipal: string;
  resumenTema: string;
  comentariosTestimonios: string;
  fecha: string;
}

export default function CuartoDeGuerra() {
  const { toast } = useToast();
  const [reports, setReports] = useState<CuartoDeGuerraReport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [nombreEnsenanza, setNombreEnsenanza] = useState('');
  const [asistentes, setAsistentes] = useState<string[]>(['']);
  const [versiculoPrincipal, setVersiculoPrincipal] = useState('');
  const [resumenTema, setResumenTema] = useState('');
  const [comentariosTestimonios, setComentariosTestimonios] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [pdfs, setPdfs] = useState<CuartoDeGuerraPdf[]>([]);

  useEffect(() => {
    setPdfs(getCuartoDeGuerraPdfs());
  }, []);

  const addAsistente = () => setAsistentes([...asistentes, '']);
  const removeAsistente = (index: number) => {
    if (asistentes.length > 1) {
      setAsistentes(asistentes.filter((_, i) => i !== index));
    }
  };
  const updateAsistente = (index: number, value: string) => {
    const updated = [...asistentes];
    updated[index] = value;
    setAsistentes(updated);
  };

  const handleSubmit = () => {
    if (!nombreEnsenanza.trim() || !versiculoPrincipal.trim() || !resumenTema.trim()) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa los campos obligatorios.',
        variant: 'destructive',
      });
      return;
    }

    const newReport: CuartoDeGuerraReport = {
      id: crypto.randomUUID(),
      nombreEnsenanza,
      asistentes: asistentes.filter(a => a.trim()),
      versiculoPrincipal,
      resumenTema,
      comentariosTestimonios,
      fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
    };

    setReports([newReport, ...reports]);
    setNombreEnsenanza('');
    setAsistentes(['']);
    setVersiculoPrincipal('');
    setResumenTema('');
    setComentariosTestimonios('');
    setShowForm(false);

    toast({
      title: 'Reporte creado',
      description: 'El reporte del Cuarto de Guerra se ha guardado correctamente.',
    });
  };

  const handleDeletePdf = (id: string) => {
    const updated = pdfs.filter(p => p.id !== id);
    saveCuartoDeGuerraPdfs(updated);
    setPdfs(updated);
    toast({ title: 'PDF eliminado' });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Cuarto de Guerra</h1>
              <p className="text-muted-foreground text-sm">Reportes de enseñanzas y reuniones de oración</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowUploadDialog(true)} className="gap-2">
              <Upload className="w-4 h-4" />
              Subir PDF
            </Button>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Reporte
            </Button>
          </div>
        </div>

        {/* PDF List */}
        {pdfs.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Documentos PDF
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pdfs.map(pdf => (
                <div key={pdf.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{pdf.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pdf.uploadedAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => downloadCuartoDeGuerraPdf(pdf)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeletePdf(pdf.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {showForm && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Nuevo Reporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombreEnsenanza">Nombre de quién dio la Enseñanza *</Label>
                <Input id="nombreEnsenanza" value={nombreEnsenanza} onChange={e => setNombreEnsenanza(e.target.value)} placeholder="Nombre completo" />
              </div>

              <div className="space-y-2">
                <Label>Nombre de Asistentes</Label>
                {asistentes.map((asistente, index) => (
                  <div key={index} className="flex gap-2">
                    <Input value={asistente} onChange={e => updateAsistente(index, e.target.value)} placeholder={`Asistente ${index + 1}`} />
                    {asistentes.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeAsistente(index)} className="shrink-0 text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addAsistente} className="gap-1.5 mt-1">
                  <UserPlus className="w-4 h-4" />
                  Agregar Asistente
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="versiculo">Versículo Principal *</Label>
                <Input id="versiculo" value={versiculoPrincipal} onChange={e => setVersiculoPrincipal(e.target.value)} placeholder="Ej: Juan 3:16" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resumen">Resumen Corto del Tema *</Label>
                <Textarea id="resumen" value={resumenTema} onChange={e => setResumenTema(e.target.value)} placeholder="Escribe un resumen breve del tema tratado..." rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comentarios">Comentarios y/o Testimonios</Label>
                <Textarea id="comentarios" value={comentariosTestimonios} onChange={e => setComentariosTestimonios(e.target.value)} placeholder="Comentarios, testimonios o notas adicionales..." rows={3} />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSubmit}>Guardar Reporte</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {reports.length === 0 && !showForm ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">Sin reportes aún</h3>
              <p className="text-sm text-muted-foreground">Crea tu primer reporte del Cuarto de Guerra</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reports.map(report => (
              <Card key={report.id}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{report.nombreEnsenanza}</h3>
                    <span className="text-xs text-muted-foreground">{report.fecha}</span>
                  </div>
                  <div className="text-sm space-y-1.5">
                    <p><span className="font-medium text-muted-foreground">Versículo:</span> {report.versiculoPrincipal}</p>
                    <p><span className="font-medium text-muted-foreground">Resumen:</span> {report.resumenTema}</p>
                    {report.asistentes.length > 0 && (
                      <p><span className="font-medium text-muted-foreground">Asistentes:</span> {report.asistentes.join(', ')}</p>
                    )}
                    {report.comentariosTestimonios && (
                      <p><span className="font-medium text-muted-foreground">Comentarios:</span> {report.comentariosTestimonios}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <UploadPdfDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUploaded={() => setPdfs(getCuartoDeGuerraPdfs())}
      />
    </MainLayout>
  );
}
