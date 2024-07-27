export function byteToMB(byte: number) {
  return (byte * 0.000001).toFixed(2);
}

export function downloadFileFromCache(fileId: string, name: string) {
  caches.open('sky-pack-files').then((cache) => {
    cache.match(`/${fileId}`).then(async (res) => {
      const blob = await res?.blob();
      if (!blob) return;
      const data = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = data;
      link.download = name;
      link.click();
    });
  });
}

export function downloadFileFromBlob(blob: Blob, name: string) {
  const data = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = data;
  link.download = name;
  link.click();
}

export function putBlobToCache(blob: Blob, url: string) {
  caches.open('sky-pack-files').then((cache) => {
    cache.put(url, new Response(blob, {
      headers: {
        'Content-Type': blob.type,
        'Content-Length': String(blob.size)
      }
    }))
  })
}