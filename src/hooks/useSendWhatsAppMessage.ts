import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sanitizeTextContent, sanitizePhoneNumber, sanitizeUrl } from '@/lib/security';
import { logError } from '@/lib/logger';

interface SendMessageParams {
  connectionId: string;
  to: string;
  message: string;
  type?: 'text' | 'image' | 'document';
  mediaUrl?: string;
}

export function useSendWhatsAppMessage() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: SendMessageParams) => {
      // Sanitize inputs
      const sanitizedMessage = sanitizeTextContent(params.message);
      const sanitizedTo = sanitizePhoneNumber(params.to);
      const sanitizedMediaUrl = params.mediaUrl ? sanitizeUrl(params.mediaUrl) : undefined;

      // Validate message is not empty after sanitization
      if (!sanitizedMessage.trim()) {
        throw new Error('Mensagem não pode estar vazia');
      }

      // Validate phone number
      if (!sanitizedTo || sanitizedTo.length < 10) {
        throw new Error('Número de telefone inválido');
      }

      const { data, error } = await supabase.functions.invoke('whatsapp-send', {
        body: {
          connection_id: params.connectionId,
          to: sanitizedTo,
          message: sanitizedMessage,
          type: params.type || 'text',
          media_url: sanitizedMediaUrl,
        },
      });

      if (error) {
        logError('Error sending WhatsApp message', error, 'useSendWhatsAppMessage');
        throw error;
      }
      if (data?.error) {
        const error = new Error(data.error);
        logError('WhatsApp send function returned error', error, 'useSendWhatsAppMessage');
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Mensagem enviada',
        description: 'Sua mensagem foi enviada com sucesso',
      });
    },
    onError: (error: Error) => {
      logError('Failed to send WhatsApp message', error, 'useSendWhatsAppMessage');
      toast({
        title: 'Erro ao enviar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
