import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/services/api';
import { DEV_MODE_BYPASS_AUTH } from '@/config/dev';

const Signin = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  // Redirect to dashboard if already logged in
  // Middleware ham buni qiladi, lekin bu yerda ham tekshirish yaxshi
  useEffect(() => {
    if (!DEV_MODE_BYPASS_AUTH) {
      const token = localStorage.getItem('token');
      if (token) {
        // Kichik kechikish - middleware bilan conflict bo'lmasligi uchun
        setTimeout(() => {
          // Agar location.state.from bo'lsa (masalan, protected route'dan kelgan bo'lsa), o'sha URL'ga yo'naltirish
          // Aks holda dashboard'ga
          const from = location.state?.from?.pathname;
          const redirectTo = from && from !== '/signin' ? from : '/dashboard';
          navigate(redirectTo, { replace: true });
        }, 100);
      }
    }
  }, [navigate]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const handleSignIn = async (data) => {
    const { phoneNumber, password } = data;
    setError('');
    try {
      const response = await api.post('/store/login', {
        phoneNumber,
        password,
      });

      // API interceptor response.data qaytaradi, lekin NestJS strukturasi turli bo'lishi mumkin
      // Barcha variantlarni tekshirish
      let token = null;
      let store = null;
      
      if (response) {
        // Variant 1: response.data.token
        if (response.data?.token) {
          token = response.data.token;
          store = response.data.store;
        }
        // Variant 2: response.token
        else if (response.token) {
          token = response.token;
          store = response.store;
        }
        // Variant 3: response nested structure
        else if (response.data?.data?.token) {
          token = response.data.data.token;
          store = response.data.data.store;
        }
      }
      
      if (token) {
        // Store token and store data
        localStorage.setItem('token', token);
        // Login vaqtini saqlash - API interceptor'da 401 xatolarini e'tiborsiz qoldirish uchun
        localStorage.setItem('lastLoginTime', Date.now().toString());
        if (store && store._id) {
          localStorage.setItem('storeId', store._id);
          // Store ma'lumotlarini localStorage'ga saqlash
          localStorage.setItem('storeData', JSON.stringify(store));
        }
        
        // SessionStorage'dagi eski 401 xatolarini tozalash
        sessionStorage.removeItem('failed401Requests');
        
        toast.success(t('general.success') || 'Muvaffaqiyatli kirildi');
        // Navigate'ni darhol chaqirish - token allaqachon saqlangan
        navigate('/dashboard', { replace: true });
      } else {
        console.error('Login response structure:', response);
        setError('Login failed. Token not received from server.');
        toast.error('Login failed. Token not received from server.');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error?.message || error?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        to="/"
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'hidden absolute left-4 top-4 md:left-8 md:top-8'
        )}
      >
        <>
          <ChevronLeft className="mr-2 size-4" />
          {t('back')}
        </>
      </Link>
      <Select
        onValueChange={changeLanguage}
        value={i18n.language}
        defaultValue="en"
      >
        <SelectTrigger className="hidden absolute right-4 top-4 md:right-8 md:top-8 w-32">
          <SelectValue placeholder={t('languagesTitle')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="de">German</SelectItem>
        </SelectContent>
      </Select>
      <div className="mx-auto flex w-full flex-col justify-center gap-6 sm:w-[350px]">
        <div className="flex flex-col gap-2 text-center">
          <img
            src="/assets/logos/uygaayt-shape.svg"
            alt="Uygaayt Logo"
            className="w-10 h-10 mx-auto"
          />
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('Uygaayt Super Admin')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('Hisobga kirish uchun telefon raqami va parol kiriting')}
          </p>
        </div>
        <form
          onSubmit={handleSubmit(handleSignIn)}
          className="space-y-2 md:space-y-3"
        >
          <div className="space-y-1">
            <Label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t('Telefon raqami') || 'Telefon raqami'}
            </Label>
            <Input
              type="tel"
              id="phoneNumber"
              placeholder="+998901234567"
              {...register('phoneNumber', { 
                required: 'Telefon raqami majburiy',
                pattern: {
                  value: /^\+[1-9]\d{7,14}$/,
                  message: 'Telefon raqami noto\'g\'ri formatda'
                }
              })}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500 mt-2">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t('Parol') || 'Parol'}
            </Label>
              <p className="hidden text-muted-foreground text-xs">
                <Link
                  to="/forgot-password"
                  className="hover:text-brand underline underline-offset-4"
                >
                  {t('forgotPassword')}
                </Link>
              </p>
            </div>
            <Input
              type="password"
              id="password"
              placeholder="********"
              {...register('password', { required: 'Parol majburiy' })}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-2">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button disabled={isSubmitting} type="submit" className="w-full">
            {isSubmitting ? 'Hisobga kirilmoqda...' : `${t('Hisobga kirish')}`}
          </Button>

          {error && (
            <p className="text-sm text-red-500 mt-4 text-center">{error}</p>
          )}
        </form>
        <div className="relative hidden">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">
              {t('or')}
            </span>
          </div>
        </div>
        {/* <Button
          onClick={handleAnonymousSignIn}
          className="w-full"
          variant="secondary"
        >
          <img className="w-5 h-5" src="/assets/ghost.png" alt="Ghost png" />
          {t('signinButtonGhost')}
        </Button> */}
        {/* <p className="text-muted-foreground px-8 text-center text-sm">
          <Link
            to="/signup"
            className="hover:text-brand underline underline-offset-4"
          >
            {t('doNotHaveProfile')}
          </Link>
        </p> */}
      </div>
    </div>
  );
};

export default Signin;
