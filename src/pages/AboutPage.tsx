import { Award, Clock, Users, Scissors, Star, Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getBarbers } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface Barber {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profile_image_url?: string;
}

const AboutPage = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        setLoading(true);
        const { data, error } = await getBarbers();
        
        if (error) throw error;
        
        if (data) {
          setBarbers(data);
        }
      } catch (error: any) {
        console.error("Erro ao buscar barbeiros:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar lista de barbeiros.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();
  }, []);

  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-barber-dark">
        <div className="container mx-auto px-4 text-center">
          <h5 className="text-barber-gold uppercase tracking-wider mb-3 font-medium">Quem Somos</h5>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Sobre o Studio53</h1>
          <p className="text-lg text-barber-gray mb-8">
            O Studio53 é um destino premium de barbearia onde a tradição encontra a expertise moderna,
            oferecendo serviços excepcionais em um ambiente sofisticado.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-barber">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h5 className="text-barber-gold uppercase tracking-wider mb-3 font-medium animate-fade-in">Nossa História</h5>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 relative">
                Uma Tradição de Excelência Desde <span className="text-barber-gold">2025</span>
                <div className="h-1 w-24 bg-barber-gold mt-4"></div>
              </h2>
              <p className="text-lg text-barber-gray mb-8 leading-relaxed">
                O <span className="text-barber-gold font-medium">Studio53</span> foi fundado em 2025 por um jovem barbeiro com pouca experiência, mas com uma 
                <span className="text-white font-medium"> vontade imensa de aprender</span> e 
                crescer dentro do mundo da barbearia. Com <span className="text-barber-gold">coragem</span>, <span className="text-barber-gold">dedicação</span> e <span className="text-barber-gold">espírito empreendedor</span>, 
                decidiu abrir as portas do seu próprio espaço, mesmo sabendo que o caminho seria cheio de desafios.
                Acreditando que a prática, o esforço e o bom atendimento são tão importantes quanto a técnica, 
                transformou a barbearia num lugar acolhedor, onde cada cliente é tratado com atenção e respeito. 
              </p>
              <p className="text-barber-gray mb-6 leading-relaxed border-l-2 border-barber-gold pl-4">
                Logo depois, juntou-se à equipa um segundo barbeiro, também dedicado e com vontade de evoluir, 
                tornando o ambiente ainda mais dinâmico e familiar.
              </p>
              <p className="text-lg text-barber-gray mb-8 leading-relaxed">
                O <span className="text-barber-gold font-medium">Studio53</span> é mais do que um negócio — é um 
                <span className="text-white font-medium"> projeto de vida</span>, construído com 
                <span className="text-barber-gold"> suor</span>, <span className="text-barber-gold">humildade</span> e muito <span className="text-barber-gold">coração</span>. 
                Aqui, cada corte representa um passo na nossa jornada de crescimento.
                <span className="block mt-4 text-barber-gold font-medium italic">Estamos só no começo… mas a tesoura não para.</span>
              </p>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 border-2 border-barber-gold translate-x-5 translate-y-5 z-0"></div>
                <img 
                  src="/img/duarte a cortar.jpg" 
                  alt="História da barbearia" 
                  className="relative z-10 w-full h-[400px] object-cover"
                  style={{ objectPosition: '50% 40%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-barber-dark">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard 
              icon={<Users size={32} />}
              value="1k"
              label="Clientes Satisfeitos"
            />
            <StatCard 
              icon={<Scissors size={32} />}
              value={loading ? "-" : barbers.length.toString()}
              label="Barbeiros Especializados"
            />
            <StatCard 
              icon={<Award size={32} />}
              value="1"
              label="Anos de Experiência"
            />
            <StatCard 
              icon={<Clock size={32} />}
              value="1k+"
              label="Horas de Serviço"
            />
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-barber">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h5 className="text-barber-gold uppercase tracking-wider mb-3 font-medium">O Que Defendemos</h5>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossos Valores & Missão</h2>
            <div className="h-1 w-24 bg-barber-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <ValueCard 
              title="Excelência"
              description="Comprometemo-nos a prestar serviços excepcionais e resultados que superam as expectativas em todos os aspetos do nosso trabalho."
            />
            <ValueCard 
              title="Integridade"
              description="Operamos com honestidade, transparência e um desejo genuíno de proporcionar a melhor experiência aos nossos clientes."
            />
            <ValueCard 
              title="Artesanato"
              description="Abordamos cada corte de cabelo como uma obra de arte, combinando habilidade técnica com visão criativa para alcançar resultados perfeitos."
            />
            <ValueCard 
              title="Respeito"
              description="Tratamos cada cliente com o máximo respeito, valorizando o seu tempo, preferências e estilo individual."
            />
            <ValueCard 
              title="Comunidade"
              description="Orgulhamo-nos de ser um local de encontro onde se constroem relacionamentos e se fortalecem as conexões comunitárias."
            />
            <ValueCard 
              title="Crescimento"
              description="Buscamos continuamente melhorar as nossas habilidades, conhecimentos e serviços para proporcionar a melhor experiência possível."
            />
          </div>

          <div className="bg-barber-light p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4 text-center">Nossa Missão</h3>
            <p className="text-lg text-barber-gray">
              No Studio53, a nossa missão é fornecer serviços excepcionais de barbearia que realcem a aparência e a confiança dos nossos clientes em um ambiente acolhedor e profissional. Estamos dedicados a preservar a arte da barbearia tradicional, ao mesmo tempo que abraçamos técnicas e tendências modernas.
            </p>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-16 bg-barber-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h5 className="text-barber-gold uppercase tracking-wider mb-3 font-medium">Os Profissionais</h5>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Conheça Nossos Barbeiros</h2>
            <div className="h-1 w-24 bg-barber-gold mx-auto"></div>
            <p className="mt-6 text-barber-gray max-w-2xl mx-auto">
              A nossa equipa é composta por profissionais qualificados e bastantes formações. 
              Cada barbeiro traz a sua expertise e paixões únicas para entregar resultados excepcionais.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
              <h2 className="font-serif italic text-[250px] text-white/[0.02] whitespace-nowrap tracking-widest" style={{ 
                fontFamily: 'Playfair Display, serif',
                textShadow: '0 0 1px rgba(255,255,255,0.05)',
                transform: 'translateY(-10%)'
              }}>
                Studio 53
              </h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 text-barber-gold animate-spin" />
                <span className="ml-2 text-barber-gray">Carregando equipe...</span>
              </div>
            ) : barbers.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-barber-gray">Nenhum barbeiro cadastrado no momento.</p>
              </div>
            ) : (
              <div className={`flex flex-wrap justify-center gap-8 max-w-4xl mx-auto relative z-10 ${barbers.length > 2 ? 'md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:max-w-6xl' : ''}`}>
                {barbers.map(barber => (
                  <BarberCard 
                    key={barber.id}
                    name={barber.name} 
                    role="Barbeiro"
                    experience="Especialista em cortes"
                    specialty="Degradês & barbas"
                    imageUrl={barber.profile_image_url || "/img/barber-placeholder.jpg"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

const StatCard = ({ 
  icon, 
  value, 
  label 
}: { 
  icon: React.ReactNode; 
  value: string; 
  label: string;
}) => {
  return (
    <div className="text-center p-6">
      <div className="text-barber-gold mb-4">{icon}</div>
      <h3 className="text-3xl md:text-4xl font-bold mb-2">{value}</h3>
      <p className="text-barber-gray uppercase tracking-wider text-sm">{label}</p>
    </div>
  );
};

const ValueCard = ({ 
  title, 
  description 
}: { 
  title: string; 
  description: string;
}) => {
  return (
    <div className="bg-barber-light p-6 rounded-md transition-transform duration-300 hover:-translate-y-2">
      <div className="flex items-center mb-4">
        <div className="mr-4 text-barber-gold">
          <Star size={24} />
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-barber-gray">{description}</p>
    </div>
  );
};

const BarberCard = ({ 
  name, 
  role, 
  experience,
  specialty,
  imageUrl 
}: { 
  name: string; 
  role: string; 
  experience: string;
  specialty: string;
  imageUrl: string;
}) => {
  return (
    <div className="bg-barber-light rounded-lg overflow-hidden w-full max-w-[320px] mx-auto group">
      <div className="relative h-[380px] overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover object-[center_15%] transition-transform duration-700 group-hover:scale-105 brightness-95"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/img/barber-placeholder.jpg"; // Imagem padrão caso a URL da imagem falhe
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
      </div>
      <div className="p-6 relative">
        <h3 className="text-xl font-bold mb-1">{name}</h3>
        <p className="text-barber-gold mb-3">{role}</p>
        <ul className="space-y-1.5">
          <li className="flex items-start text-sm">
            <Check size={16} className="mr-2 text-barber-gold shrink-0 mt-0.5" />
            <span className="text-barber-gray">{experience}</span>
          </li>
          <li className="flex items-start text-sm">
            <Check size={16} className="mr-2 text-barber-gold shrink-0 mt-0.5" />
            <span className="text-barber-gray">{specialty}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

const keyframes = `
@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-33.33%);
  }
}
`;

const style = document.createElement('style');
style.textContent = keyframes;
document.head.appendChild(style);

export default AboutPage;
