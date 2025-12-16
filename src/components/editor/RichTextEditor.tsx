'use client'

import { useEffect, useRef, useState } from 'react'
import 'quill/dist/quill.snow.css';
import { uploadMedia } from '@/ai/flows/upload-media-flow';
import { useToast } from '@/hooks/use-toast';

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const [isMounted, setIsMounted] = useState(false)
  const quillRef = useRef<any>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange);
  const { toast } = useToast();

  // Mantener onChangeRef actualizado con la última función onChange
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || !editorRef.current || quillRef.current) {
      // Si no está montado, no hay ref del editor, o quill ya está inicializado, no hacer nada.
      return;
    }

    const loadQuill = async () => {
      const Quill = (await import('quill')).default;
      
      // --- Configuración correcta del tamaño de fuente ---
      const Parchment = Quill.import('parchment');
      const sizeWhitelist = ['8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '60px', '72px'];

      // Crear attributor de estilo para font-size
      const SizeStyle = new Parchment.Attributor.Style('size', 'font-size', {
        scope: Parchment.Scope.INLINE,
        whitelist: sizeWhitelist
      });

      Quill.register(SizeStyle, true);
      // --- Fin de la configuración ---
      
      const toolbarOptions = [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': sizeWhitelist }], // Añadido el selector de tamaño
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [false, 'center', 'right', 'justify'] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image', 'video', 'blockquote', 'code-block'],
        ['clean']
      ];

      quillRef.current = new Quill(editorRef.current!, {
        theme: 'snow',
        placeholder: placeholder || '',
        modules: {
          toolbar: toolbarOptions
        }
      });
      
      // Manejador para la subida de imágenes
      const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            if (input.files) {
                const file = input.files[0];
                if (file.size > MAX_FILE_SIZE_BYTES) {
                    toast({
                        variant: 'destructive',
                        title: "Archivo muy pesado",
                        description: `El archivo es muy pesado. Máximo ${MAX_FILE_SIZE_MB}MB.`,
                    });
                    input.value = ""; // Clear the input
                    return;
                }
                const reader = new FileReader();
                reader.readAsDataURL(file);
                const range = quillRef.current.getSelection(true);
                reader.onloadend = async () => {
                    const mediaDataUri = reader.result as string;
                    try {
                        quillRef.current.insertEmbed(range.index, 'image', `data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7`);
                        quillRef.current.setSelection(range.index + 1);

                        const result = await uploadMedia({ mediaDataUri });
                        
                        quillRef.current.deleteText(range.index, 1);
                        quillRef.current.insertEmbed(range.index, 'image', result.secure_url);
                        quillRef.current.setSelection(range.index + 1);
                    } catch (error) {
                        console.error('Image upload failed', error);
                        if (range) {
                            quillRef.current.deleteText(range.index, 1);
                        }
                    }
                }
            }
        };
      };

      quillRef.current.getModule('toolbar').addHandler('image', imageHandler);

      // Establecer valor inicial
      if (value) {
        quillRef.current.root.innerHTML = value;
      }

      // Añadir listener para los cambios
      quillRef.current.on('text-change', (delta: any, oldDelta: any, source: string) => {
        if (source === 'user') {
          onChangeRef.current(quillRef.current.root.innerHTML);
        }
      });
    };

    loadQuill();

    // Función de limpieza
    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]); // Este efecto se ejecuta solo UNA VEZ cuando isMounted se vuelve true.

  // Efecto para actualizar el contenido cuando la prop `value` cambia desde fuera
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      const selection = quillRef.current.getSelection()
      quillRef.current.root.innerHTML = value
      if (selection) {
        // Intenta restaurar la selección
        quillRef.current.setSelection(selection.index, selection.length)
      }
    }
  }, [value])

  if (!isMounted) {
    // Muestra un esqueleto de carga mientras el editor se monta en el cliente
    return <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
  }

  return (
    <div className="rich-editor-wrapper">
      <div ref={editorRef} />
    </div>
  )
}

export default RichTextEditor;
