import { useState, ChangeEvent, FormEvent } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import SEO from '@/components/SEO';

export default function Members() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    birthPlace: '', // Naturalidade
    nationality: 'Portuguesa',
    birthDate: '',
    gender: 'masculino',
    ccNumber: '',
    nif: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '', // Localidade
    volunteer: false,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setError('A foto deve ter no máximo 2MB.');
        return;
      }
      setPhoto(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let photoUrl = '';

      // Upload photo if exists
      if (photo) {
        const storageRef = ref(storage, `members/${Date.now()}_${photo.name}`);
        const snapshot = await uploadBytes(storageRef, photo);
        photoUrl = await getDownloadURL(snapshot.ref);
      }

      // Save to Firestore
      await addDoc(collection(db, 'members'), {
        ...formData,
        photoUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setFormData({
        fullName: '',
        birthPlace: '',
        nationality: 'Portuguesa',
        birthDate: '',
        gender: 'masculino',
        ccNumber: '',
        nif: '',
        email: '',
        phone: '',
        address: '',
        postalCode: '',
        city: '',
        volunteer: false,
      });
      setPhoto(null);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Ocorreu um erro ao submeter o formulário. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SEO
        title="Sócios"
        description="Torna-te sócio da Rodactiva e junta-te à nossa comunidade de ciclismo em Castro Marim."
      />

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/members-header.jpg"
            alt="Rodactiva Team"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Junta-te a nós
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light">
            Inscrição de novos sócios
          </p>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 shadow-xl bg-white dark:bg-slate-900 border-t-4 border-t-orange-600">
            <div className="mb-8 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Inscrição de novos sócios
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                É muito fácil juntares-te à Rodactiva. Basta para tal fazeres a tua inscrição de novo sócio online e posteriormente efetuares uma transferência bancária à ordem da Rodactiva no valor de <span className="font-bold text-orange-600">20 Euros</span> para o NIB: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">003502340000773893074</span> (CGD), relativo ao pagamento da respetiva jóia de inscrição e um semestre de cotas.
              </p>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>Importante!</strong> Não esquecer enviar o comprovativo de transferência com a indicação do nome para o seguinte e-mail: <a href="mailto:rodactiva.geral@gmail.com" className="underline hover:text-orange-900">rodactiva.geral@gmail.com</a>
                </p>
              </div>
            </div>

            {success ? (
              <div className="text-center py-12 space-y-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Inscrição Submetida com Sucesso!
                </h3>
                <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Obrigado por te juntares à Rodactiva. Não te esqueças de enviar o comprovativo de pagamento para o nosso email para finalizarmos o processo.
                </p>
                <Button
                  onClick={() => setSuccess(false)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Nova Inscrição
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                    Dados Pessoais
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthPlace">Naturalidade</Label>
                    <Input
                      id="birthPlace"
                      name="birthPlace"
                      required
                      value={formData.birthPlace}
                      onChange={handleInputChange}
                      className="bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nacionalidade</Label>
                      <Select
                        value={formData.nationality}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, nationality: value }))}
                      >
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-800">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Portuguesa">Portuguesa</SelectItem>
                          <SelectItem value="Espanhola">Espanhola</SelectItem>
                          <SelectItem value="Outra">Outra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Data de nascimento</Label>
                      <Input
                        id="birthDate"
                        name="birthDate"
                        type="date"
                        required
                        value={formData.birthDate}
                        onChange={handleInputChange}
                        className="bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Género</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="masculino" id="masculino" />
                        <Label htmlFor="masculino">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="feminino" id="feminino" />
                        <Label htmlFor="feminino">Feminino</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ccNumber">N.º C.C.</Label>
                      <Input
                        id="ccNumber"
                        name="ccNumber"
                        required
                        value={formData.ccNumber}
                        onChange={handleInputChange}
                        className="bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nif">NIF</Label>
                      <Input
                        id="nif"
                        name="nif"
                        required
                        value={formData.nif}
                        onChange={handleInputChange}
                        className="bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 border-b border-slate-200 dark:border-slate-800 pb-2 pt-4">
                    Contactos
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telemóvel</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Morada</Label>
                    <Input
                      id="address"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Código Postal</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Localidade</Label>
                      <Input
                        id="city"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 border-b border-slate-200 dark:border-slate-800 pb-2 pt-4">
                    Outros
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="photo">Insira uma foto (max 2mb)</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="bg-slate-50 dark:bg-slate-800 cursor-pointer"
                      />
                    </div>
                    {photo && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Foto selecionada: {photo.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label>Voluntário?</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Assinale se se propõe como voluntário para a estrutura organizativa dos eventos da RODACTIVA.
                    </p>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="volunteer"
                        checked={formData.volunteer}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, volunteer: checked as boolean }))}
                      />
                      <Label htmlFor="volunteer" className="cursor-pointer font-normal">
                        Aceito ser voluntário
                      </Label>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" /> Submetendo...
                    </>
                  ) : (
                    'Submeter Inscrição'
                  )}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
