import { ArrowRight, Calendar, Check, Loader2, Scissors, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getServices } from '@/lib/supabase';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  isCombo: boolean;
  includedServices?: string[];
}

const HomePage = () => {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const { data, error } = await getServices();
        
        if (error) throw error;
        
        if (data) {
          const formattedServices = data.map(service => ({
            id: service.id,
            name: service.name,
            description: service.description || '',
            price: service.price || 0,
            duration: service.duration || 30,
            isCombo: service.is_combo || false,
            includedServices: service.included_services || []
          }));
          
          // Exibir apenas 3 serviços em destaque (preferir adicionar primeiro os não-combos)
          const nonComboServices = formattedServices.filter(service => !service.isCombo);
          const comboServices = formattedServices.filter(service => service.isCombo);
          
          // Pegar os primeiros serviços para o destaque, priorizando serviços não-combo
          const featured = [...nonComboServices, ...comboServices].slice(0, 3);
          setFeaturedServices(featured);
        }
      } catch (error) {
        console.error("Erro ao buscar serviços:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen relative flex items-center bg-[#0a0a0a] overflow-hidden">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent z-10"></div>
        
        {/* Background image */}
        <div className="absolute right-0 top-0 h-full w-1/2">
          <img 
            src="/img/Barbearia 2.jpg" 
            alt="Studio53 Interior" 
            className="h-full w-full object-cover object-center"
          />
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#0a0a0a]/30 to-[#0a0a0a] opacity-100"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-2xl">
            <h5 className="text-barber-gold uppercase tracking-wider mb-3 font-medium">
              BEM-VINDO AO STUDIO53
            </h5>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Cortes de Cabelo Excepcionais & Barbearia para Cavalheiros
            </h1>
            <p className="text-barber-gray text-lg mb-8 max-w-xl">
              O Studio53 foi fundado com a missão de reviver a arte tradicional da barbearia, incorporando técnicas e tendências modernas.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-barber-gold hover:bg-barber-gold/90 text-black">
                <Link to="/booking">
                  Marcar Horário
                  <Calendar className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-barber-gold text-barber-gold hover:bg-barber-gold hover:text-black">
                <Link to="/services">
                  Ver Serviços
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="bg-barber section-padding">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Serviços de Destaque</h2>
            <div className="h-1 w-24 bg-barber-gold mx-auto"></div>
            <p className="mt-6 text-barber-gray max-w-2xl mx-auto">
              Oferecemos uma variedade de serviços de barbearia premium adaptados às tuas necessidades.
              Cada serviço é realizado com atenção meticulosa aos detalhes.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-barber-gold animate-spin" />
              <span className="ml-2 text-barber-gray">Carregando serviços...</span>
            </div>
          ) : featuredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-barber-gray">Nenhum serviço disponível no momento.</p>
              <Button asChild className="mt-4 bg-barber-gold hover:bg-barber-gold/90 text-black">
                <Link to="/admin">Adicionar Serviços</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredServices.map((service, index) => (
                <ServiceCard 
                  key={service.id}
                  title={service.name}
                  price={service.price}
                  description={service.description}
                  imageUrl={getServiceImage(service.name, index)}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button asChild variant="outline" className="border-barber-gold text-barber-gold hover:bg-barber-gold hover:text-black">
              <Link to="/services">Ver Todos os Serviços</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="bg-barber-dark section-padding">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <h5 className="text-barber-gold uppercase tracking-wider mb-3 font-medium">Sobre Nós</h5>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Uma Tradição de Excelência Desde 2025
              </h2>
              <p className="text-barber-gray mb-6">
              O Studio53 nasceu em 2025 com uma visão clara: transformar cada 
              corte numa experiência única. Somos uma barbearia jovem, 
              movida pela paixão, pela dedicação e pela vontade constante de evoluir.
              Embora os nossos profissionais estejam a dar os primeiros passos na carreira
              cada cliente que entra no nosso estúdio sente o empenho, o cuidado e o detalhe em cada trabalho.
              Acreditamos que o talento não está apenas no tempo de carreira, mas na atitude com que se trabalha. 
              Estamos aqui para crescer, aprender e elevar a arte da barbearia todos os dias. No Studio53, 
              não oferecemos apenas cortes — oferecemos compromisso com o teu estilo.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Produtos e ferramentas premium",
                  "Atmosfera relaxante e acolhedora",
                  "Atenção aos detalhes em cada serviço"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-3 text-barber-gold"><Check size={20} /></span>
                    <span className="text-barber-gray">{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="bg-barber-gold hover:bg-barber-gold/90 text-black">
                <Link to="/about">Saiba Mais Sobre Nós</Link>
              </Button>
            </div>
            <div className="mt-8 lg:mt-0">
              <div className="relative w-full h-[500px] p-2">
                <div className="relative w-full h-full border-2 border-barber-gold overflow-hidden group">
                  <img 
                    src="/img/Barbearia 1.jpg" 
                    alt="Interior do Studio53" 
                    className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 ease-in-out transform group-hover:scale-105 group-hover:opacity-0"
                  />
                  <img 
                    src="/img/Barbearia 2.jpg" 
                    alt="Interior do Studio53" 
                    className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 ease-in-out transform scale-105 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-barber section-padding">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Por Que Escolher o Studio53</h2>
            <div className="h-1 w-24 bg-barber-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Scissors />}
              title="Barbeiros Especializados"
              description="A nossa equipa é composta por profissionais qualificados com pouco tempo de experiência, mas com a maior vontade de aprender e evoluir."
            />
            <FeatureCard 
              icon={<Star />}
              title="Produtos Premium"
              description="Utilizamos apenas produtos de alta qualidade que garantem os melhores resultados para o seu cabelo e pele."
            />
            <FeatureCard 
              icon={<Calendar />}
              title="Agendamento Fácil"
              description="Marque o seu horário online com o nosso sistema de agendamento conveniente, disponível 24/7."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-barber-gold py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">Pronto para um Visual Novo?</h2>
          <p className="text-barber-dark mb-8 max-w-2xl mx-auto">
            Marca o teu horário hoje e experimenta a diferença do Studio53. 
            A nossa equipa é qualificada está pronta para ajudar-lhe a ficar com a melhor aparência e com a auto-estima no topo.
          </p>
          <Button asChild size="lg" className="bg-black hover:bg-black/90 text-white">
            <Link to="/booking">
              Marque o Seu Horário!
              <Calendar className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
};

const ServiceCard = ({ 
  title, 
  price, 
  description, 
  imageUrl 
}: { 
  title: string; 
  price: number; 
  description: string; 
  imageUrl: string;
}) => {
  return (
    <div className="bg-barber-light rounded-lg overflow-hidden transition-transform duration-300 hover:-translate-y-2">
      <div className="relative h-80 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover object-center"
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold">{title}</h3>
          <span className="text-barber-gold font-bold">{price}€</span>
        </div>
        <p className="text-barber-gray mb-4">{description}</p>
        <Button asChild variant="link" className="text-barber-gold p-0 hover:text-barber-gold/80">
          <Link to="/booking">
            Marcar Agora
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

const FeatureCard = ({ 
  icon,
  title, 
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="bg-barber-light p-6 rounded-md text-center">
      <div className="mx-auto w-16 h-16 bg-barber-gold rounded-full flex items-center justify-center text-black mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-barber-gray">{description}</p>
    </div>
  );
};

const getServiceImage = (serviceName: string, index: number): string => {
  // Imagens para os 3 cards em ordem específica
  const orderedImages = [
    '/img/corte 3.jpg',
    '/img/corte2.jpg',
    '/img/Corte1.jpg'
  ];

  // Usar a imagem pelo índice, garantindo que cada card tenha sua imagem específica
  return orderedImages[index % orderedImages.length];
};

export default HomePage;
