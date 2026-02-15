# Кастомные хуки

Этот каталог содержит переиспользуемые кастомные хуки для работы с файлами.

## useFilesInitialization

Инициализирует файлы в Zustand store при загрузке страницы.

**Использование:**
```typescript
import { useFilesInitialization } from "@/hooks";

const MyPage = ({ items }: { items: FileItem[] }) => {
  useFilesInitialization(items);
  // ...
};
```

## useFileActions

Предоставляет методы для работы с файлами: удаление, восстановление, скачивание.

**Использование:**
```typescript
import { useFileActions } from "@/hooks";

const MyPage = () => {
  const { removeFiles, restoreFiles, downloadFiles, selectedFileIds } = useFileActions({
    fileType: "trash",
    onSuccess: () => console.log("Действие выполнено")
  });

  const handleDelete = () => {
    removeFiles(selectedFileIds, true); // true = постоянное удаление
  };

  const handleRestore = () => {
    restoreFiles(selectedFileIds);
  };
};
```

## useToggleFavorite

Управляет переключением статуса избранного для файлов.

**Использование:**
```typescript
import { useToggleFavorite } from "@/hooks";

const MyPage = ({ files }: { files: FileItem[] }) => {
  const { toggleFavorite } = useToggleFavorite({
    files,
    useStore: true,
    onSuccess: (file) => console.log("Файл обновлен", file)
  });

  return (
    <button onClick={() => toggleFavorite(fileId)}>
      Добавить в избранное
    </button>
  );
};
```

## Преимущества

1. **Переиспользование кода** - логика инкапсулирована в хуках
2. **Упрощение компонентов** - меньше кода в страницах
3. **Единообразие** - одинаковая логика во всех местах
4. **Тестируемость** - хуки легко тестировать отдельно
5. **Читаемость** - код становится более понятным
