import { Check, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getServices } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  isCombo: boolean;
  includedServices?: string[];
}

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
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
          setServices(formattedServices);
        }
      } catch (error: any) {
        console.error("Erro ao buscar serviços:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar lista de serviços.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Agrupar serviços por tipo (combo ou serviço individual)
  const serviceCategories = [
    {
      id: 1,
      category: "Serviços Individuais",
      items: services.filter(service => !service.isCombo)
    },
    {
      id: 2,
      category: "Combos",
      items: services.filter(service => service.isCombo)
    }
  ];

  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-barber-dark">
        <div className="container mx-auto px-4 text-center">
          <h5 className="text-barber-gold uppercase tracking-wider mb-3 font-medium">O Que Oferecemos</h5>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Os Nossos Serviços</h1>
          <p className="text-lg text-barber-gray mb-8">
            No Studio53, oferecemos uma variedade de serviços premium de barbearia adaptados às suas necessidades.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 bg-barber">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 text-barber-gold animate-spin" />
              <span className="ml-2 text-barber-gray">Carregando serviços...</span>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-barber-gray">Nenhum serviço disponível no momento.</p>
            </div>
          ) : (
            serviceCategories.map((category) => (
              category.items.length > 0 && (
                <div key={category.id} className="mb-16 last:mb-0">
                  <h2 className="text-2xl md:text-3xl font-bold mb-8 gold-border-bottom pb-3 inline-block">
                    {category.category}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {category.items.map((service) => (
                      <ServiceCard 
                        key={service.id}
                        name={service.name}
                        price={service.price}
                        description={service.description}
                        duration={`${service.duration} min`}
                        features={service.description.split('.').filter(item => item.trim() !== '')}
                      />
                    ))}
                  </div>
                </div>
              )
            ))
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-barber-dark">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Pronto para o Seu Melhor Visual?</h2>
          <p className="text-lg text-barber-gray">
            Marca a tua consulta hoje e experimente a diferença do Studio53. A nossa equipa de profissionais qualificados está pronta para te ajudar a alcançar o teu visual perfeito.
          </p>
          <Button asChild size="lg" className="bg-barber-gold hover:bg-barber-gold/90 text-black">
            <Link to="/booking">Marcar Horário</Link>
          </Button>
        </div>
      </section>
    </>
  );
};

const ServiceCard = ({ 
  name, 
  price, 
  description,
  duration,
  features
}: { 
  name: string; 
  price: number; 
  description: string; 
  duration: string;
  features: string[];
}) => {
  return (
    <div className="bg-barber-light p-6 rounded-md h-full flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold">{name}</h3>
        <span className="text-barber-gold font-bold text-xl">{price}€</span>
      </div>
      <p className="text-sm text-barber-gray mb-1">Duração: {duration}</p>
      <p className="text-barber-gray mb-4">{description}</p>
      <div className="mt-auto">
        {features.length > 0 && (
          <>
            <h4 className="font-medium mb-2">Inclui:</h4>
            <ul className="space-y-1">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm">
                  <Check size={16} className="mr-2 text-barber-gold shrink-0 mt-0.5" />
                  <span className="text-barber-gray">{feature.trim()}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="mt-4">
          <Button asChild className="w-full bg-barber-gold hover:bg-barber-gold/90 text-black">
            <Link to="/booking">Marcar Agora</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
