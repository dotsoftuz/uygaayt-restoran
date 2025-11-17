import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useServices } from '@/hooks/use-services';
import { useTemplates } from '@/hooks/use-templates';
import { getStoreCategoryById } from '@/services/storeCategories';

function CustomBreadcrumb({ showBackButton = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { clients, employees, orders } = useAppContext();
  const { services } = useServices();
  const { templates } = useTemplates();
  const [categoryBreadcrumbs, setCategoryBreadcrumbs] = React.useState([]);
  const [loadingBreadcrumbs, setLoadingBreadcrumbs] = React.useState(false);

  const pathSegments = React.useMemo(() => {
    return location.pathname
      .replace('/dashboard', '')
      .split('/')
      .filter((segment) => segment);
  }, [location.pathname]);

  const parentId = React.useMemo(() => {
    return searchParams.get('parentId');
  }, [searchParams.toString()]);

  const mainRoute = React.useMemo(() => {
    return pathSegments[0];
  }, [pathSegments]);

  // Get entity name based on current route and params
  const getEntityName = () => {
    const [mainRoute, id] = pathSegments;

    switch (mainRoute) {
      case 'clients':
        if (id) {
          const client = clients.find((c) => c.id === id);
          return client?.name || 'Unknown Client';
        }
        break;
      case 'employees':
        if (id) {
          const employee = employees.find((e) => e.id === id);
          return employee?.name || 'Unknown Employee';
        }
        break;
      case 'order-detail':
        if (id) {
          const order = orders.find((o) => o.id === id);
          return order?.title || `Order #${id}`;
        }
        break;
      case 'edit-order':
        if (id) {
          const order = orders.find((o) => o.id === id);
          return order?.title || `Edit Order #${id}`;
        }
        break;
      case 'template-detail':
        if (id) {
          const template = templates.find((t) => t.id === id);
          return template?.name || `Template #${id}`;
        }
        break;
      case 'product-detail':
        if (id) {
          // In a real app, this would fetch from a products hook/context
          return `Product #${id}`;
        }
        break;
      default:
        return null;
    }
    return null;
  };

  // Get breadcrumb configuration for different routes
  const getBreadcrumbConfig = () => {
    const [mainRoute, id] = pathSegments;
    const entityName = getEntityName();

    const configs = {
      clients: {
        label: t('Mijozlar'),
        path: '/dashboard/clients',
        hasDetail: !!id,
        detailLabel: entityName,
        detailPath: location.pathname,
      },
      employees: {
        label: t('Xodimlar'),
        path: '/dashboard/employees',
        hasDetail: !!id,
        detailLabel: entityName,
        detailPath: location.pathname,
      },
      orders: {
        label: t('Buyurtmalar'),
        path: '/dashboard/orders',
        hasDetail: false,
      },
      'order-detail': {
        label: t('Buyurtmalar'),
        path: '/dashboard/orders',
        hasDetail: true,
        detailLabel: entityName || t('Buyurtma tafsilotlari'),
        detailPath: location.pathname,
      },
      products: {
        label: t('Mahsulotlar'),
        path: '/dashboard/products',
        hasDetail: false,
      },
      'product-detail': {
        label: t('Mahsulotlar'),
        path: '/dashboard/products',
        hasDetail: true,
        detailLabel: entityName || t('Mahsulot tafsilotlari'),
        detailPath: location.pathname,
      },
      'edit-order': {
        label: t('Buyurtmalar'),
        path: '/dashboard/orders',
        hasDetail: true,
        detailLabel: entityName || t('Buyurtmani tahrirlash'),
        detailPath: location.pathname,
      },
      'create-order': {
        label: t('Yangi buyurtma'),
        path: location.pathname,
        hasDetail: false,
      },
      services: {
        label: t('Xizmatlar'),
        path: '/dashboard/services',
        hasDetail: false,
      },
      'order-template': {
        label: t('Buyurtma shablonlari'),
        path: '/dashboard/order-template',
        hasDetail: false,
      },
      'template-detail': {
        label: t('Buyurtma shablonlari'),
        path: '/dashboard/order-template',
        hasDetail: true,
        detailLabel: entityName || t('Shablon tafsilotlari'),
        detailPath: location.pathname,
      },
      'create-template': {
        label: t('Yangi shablon'),
        path: location.pathname,
        hasDetail: false,
      },
      settings: {
        label: t('Sozlamalar'),
        path: '/dashboard/settings',
        hasDetail: false,
      },
      catalog: {
        label: t('Katalog') || 'Katalog',
        path: '/dashboard/catalog',
        hasDetail: false,
      },
    };

    return configs[mainRoute] || null;
  };

  // Get category name helper
  const getCategoryName = React.useCallback((category) => {
    if (!category) return 'Nomsiz';
    const currentLang = localStorage.getItem('i18nextLng') || 'uz';
    return category.name?.[currentLang] || category.name?.uz || category.name || 'Nomsiz';
  }, []);

  // Build breadcrumbs from parent chain for catalog
  const buildCategoryBreadcrumbs = React.useCallback(async (categoryId) => {
    const crumbs = [];
    let currentId = categoryId;
    const visited = new Set(); // Prevent infinite loops
    
    while (currentId) {
      // Prevent infinite loops
      if (visited.has(currentId)) {
        console.warn('Circular reference detected in breadcrumbs');
        break;
      }
      visited.add(currentId);
      
      try {
        const response = await getStoreCategoryById(currentId);
        const catData = response?.data || response;
        if (catData && catData._id) {
          const currentLang = localStorage.getItem('i18nextLng') || 'uz';
          const categoryName = catData.name?.[currentLang] || catData.name?.uz || catData.name || 'Nomsiz';
          crumbs.unshift({
            id: catData._id,
            name: categoryName,
          });
          // Get next parent ID (handle both string and ObjectId)
          currentId = catData.parentId ? String(catData.parentId) : null;
        } else {
          break;
        }
      } catch (error) {
        console.error('Error loading breadcrumb category:', error);
        break;
      }
    }
    
    setCategoryBreadcrumbs(crumbs);
    setLoadingBreadcrumbs(false);
  }, []);

  // Load category breadcrumbs when on catalog page with parentId
  React.useEffect(() => {
    if (mainRoute === 'catalog') {
      if (parentId) {
        setLoadingBreadcrumbs(true);
        buildCategoryBreadcrumbs(parentId);
      } else {
        setCategoryBreadcrumbs([]);
        setLoadingBreadcrumbs(false);
      }
    } else {
      setCategoryBreadcrumbs([]);
      setLoadingBreadcrumbs(false);
    }
  }, [mainRoute, parentId, buildCategoryBreadcrumbs]);

  const getBreadcrumbItems = () => {
    const items = [];
    const [mainRoute] = pathSegments;

    // Check if we're on the root dashboard page
    const isRootDashboard = location.pathname === '/dashboard';

    // Always add Dashboard
    items.push({
      label: t('Dashboard'),
      path: '/dashboard',
      isLast: isRootDashboard, // If it's root dashboard, this is the last item
    });

    // If we're on root dashboard, return early with just Dashboard
    if (isRootDashboard) {
      return items;
    }

    // Special handling for catalog with category breadcrumbs
    if (mainRoute === 'catalog' && categoryBreadcrumbs.length > 0) {
      // Add Catalog
      items.push({
        label: t('Katalog') || 'Katalog',
        path: '/dashboard/catalog',
        isLast: false,
      });

      // Add category breadcrumbs
      categoryBreadcrumbs.forEach((crumb, index) => {
        const isLast = index === categoryBreadcrumbs.length - 1;
        items.push({
          label: crumb.name,
          path: `/dashboard/catalog?parentId=${crumb.id}`,
          isLast: isLast,
        });
      });

      return items;
    }

    const config = getBreadcrumbConfig();

    if (config) {
      // Add main section
      items.push({
        label: config.label,
        path: config.path,
        isLast: !config.hasDetail,
      });

      // Add detail page if exists
      if (config.hasDetail) {
        items.push({
          label: config.detailLabel,
          path: config.detailPath,
          isLast: true,
        });
      }
    } else {
      // Fallback for unknown routes
      pathSegments.forEach((segment, index) => {
        const path = `/dashboard/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;

        let label = segment.charAt(0).toUpperCase() + segment.slice(1);

        // Try to translate common segments
        const translations = {
          clients: t('Mijozlar'),
          employees: t('Xodimlar'),
          orders: t('Buyurtmalar'),
          services: t('Xizmatlar'),
          settings: t('Sozlamalar'),
          catalog: t('Katalog') || 'Katalog',
          'create-order': t('Yangi buyurtma'),
          'create-template': t('Yangi shablon'),
          'order-template': t('Buyurtma shablonlari'),
        };

        if (translations[segment]) {
          label = translations[segment];
        }

        items.push({
          label,
          path,
          isLast,
        });
      });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  const handleBackClick = () => {
    const [mainRoute] = pathSegments;

    // Navigate back to parent section
    switch (mainRoute) {
      case 'clients':
        navigate('/dashboard/clients');
        break;
      case 'employees':
        navigate('/dashboard/employees');
        break;
      case 'order-detail':
      case 'edit-order':
        navigate('/dashboard/orders');
        break;
      case 'template-detail':
        navigate('/dashboard/order-template');
        break;
      default:
        navigate(-1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackClick}
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}

      <Breadcrumb>
        <BreadcrumbList>
          {loadingBreadcrumbs ? (
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">...</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            breadcrumbItems.map((item, index) => (
              <React.Fragment key={`${item.path}-${index}`}>
                <BreadcrumbItem className={item.isLast ? '' : 'hidden md:block'}>
                  {item.isLast ? (
                    <BreadcrumbPage className="font-medium">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      as={Link}
                      to={item.path}
                      className="hover:text-primary transition-colors"
                    >
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!item.isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            ))
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

export default CustomBreadcrumb;
