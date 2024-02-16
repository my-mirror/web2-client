import React, {useEffect, useState} from 'react';

interface RoyaltyRecipient {
  address: string;
  percentage: string;
}

const UploadContentPage = () => {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [content, setContent] = useState<File | null>(null);
  const [authors, setAuthors] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [allowResale, setAllowResale] = useState(false);
  const [royaltyRecipients, setRoyaltyRecipients] = useState<RoyaltyRecipient[]>([{ address: '', percentage: '0' }]);
  const [totalPercentage, setTotalPercentage] = useState(0);

  useEffect(() => {
    let total = royaltyRecipients.reduce((acc, curr) => acc + parseFloat(curr.percentage), 0);
    if (isNaN(total)) { total = 0; }
    setTotalPercentage(total);
  }, [royaltyRecipients]);

  const addRecipient = () => {
    setRoyaltyRecipients([...royaltyRecipients, { address: '', percentage: '0' }]);
  };

  const updateRecipient = (index: number, field: 'address' | 'percentage', value: string) => {
    const updatedRecipients = [...royaltyRecipients];
    if (field === 'percentage') {
      updatedRecipients[index].percentage = value;
    } else {
      updatedRecipients[index][field] = value;
    }
    setRoyaltyRecipients(updatedRecipients);
  };

  const removeRecipient = (index: number) => {
    if (royaltyRecipients.length > 1) {
      const updatedRecipients = [...royaltyRecipients];
      updatedRecipients.splice(index, 1);
      setRoyaltyRecipients(updatedRecipients);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(title, image, content, authors, description, price, allowResale, royaltyRecipients);
  }

  return (
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Загрузка контента</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <input
            type="text"
            placeholder="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input border-gray-300 rounded-md p-2 w-full"
        />
        <input
            type="text"
            placeholder="Авторы"
            value={title}
            onChange={(e) => setAuthors(e.target.value)}
            className="input border-gray-300 rounded-md p-2 w-full"
        />
        <textarea
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea border-gray-300 rounded-md p-2 w-full h-32"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Обложка (1x1)</label>
          <input
              type="file"
              onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
              className="file-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Контент (mp3, wav, ogg)</label>
          <input
              type="file"
              onChange={(e) => setContent(e.target.files ? e.target.files[0] : null)}
              className="file-input"
          />
        </div>
        <hr/>
        <table className="table-auto flex-wrap border-solid border-2 border-indigo-600 divide-y-2 divide-indigo-600">
          {royaltyRecipients.map((recipient, index) => (
              <tr>
                <td className="w-4/6 p-0">
                  <input
                      type="text"
                      placeholder="Адрес получателя"
                      value={recipient.address}
                      onChange={(e) => updateRecipient(index, 'address', e.target.value)}
                      className="border-indigo-600 border-e-2 w-full flex-grow"
                  />
                </td>
                <td className="p-0">
                  <input
                      type="text"
                      placeholder="Процент роялти"
                      value={recipient.percentage}
                      onChange={(e) => updateRecipient(index, 'percentage', e.target.value)}
                      className="border-indigo-600 border-s-0 w-full flex-grow"
                      min="0"
                      max="100"
                      step="0.1"
                  />
                </td>
                <td className="p-0">
                  {index >= 1 && (

                      <button
                          type="button"
                          onClick={() => removeRecipient(index)}
                          className="btn w-full bg-red-600 hover:text-red-700 px-4 py-2 text-white hover:bg-red-800 transition duration-150"
                      >
                        X
                      </button>
                  )}
                </td>
              </tr>
          ))}
        </table>
        <button type="button" onClick={addRecipient} className="btn text-right">
          Добавить получателя роялти
        </button>
        {totalPercentage !== 100 && (
            <p className="text-red-500">Сумма процентов должна равняться 100%</p>
        )}
        <div>Сумма процентов: {totalPercentage}%</div>
        <hr/>
        <input
            type="text"
            placeholder="Цена в TON"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input border-gray-300 rounded-md p-2 w-full"
        />
        <div className="flex items-center">
          <input
              id="allowResale"
              type="checkbox"
              checked={allowResale}
              onChange={(e) => setAllowResale(e.target.checked)}
              className="checkbox w-4 h-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="allowResale" className="ml-2 text-sm text-gray-700">Разрешить перепродажу с отчислением
            реферального роялти?</label>
        </div>
        <button type="submit"
                className="btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded h-14 bg-gradient-to-r from-purple-500 to-pink-500">
          Загрузить контент
        </button>
      </form>
    </div>
  );
};

export default UploadContentPage;

