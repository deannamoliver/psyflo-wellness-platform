# dialog.tsx

Modal dialog component built on Radix UI Dialog primitive. Exports `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`. Includes backdrop blur and responsive styling.

**Usage:**
```tsx
<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader><DialogTitle>Title</DialogTitle></DialogHeader>
  </DialogContent>
</Dialog>
```
