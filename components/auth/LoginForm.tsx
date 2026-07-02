import LoginFormContent from './LoginFormContent';

export default function LoginForm(props: { onSuccess?: () => void }) {
  return <LoginFormContent {...props} />;
}
