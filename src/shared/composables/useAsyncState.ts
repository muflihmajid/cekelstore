import { ref } from 'vue';
import { getErrorMessage } from '@/core/errors/AppError';

export function useAsyncState() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function run<T>(callback: () => Promise<T>): Promise<T | null> {
    loading.value = true;
    error.value = null;
    try {
      return await callback();
    } catch (err) {
      error.value = getErrorMessage(err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, run };
}
